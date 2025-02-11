/**
 * @file note.service.ts
 * @brief Service that handles note-related operations including encryption, storage, and sync.
 */

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';
import { Database, ref, get } from '@angular/fire/database';
import { push, set } from '@angular/fire/database';
import { remove, child } from '@angular/fire/database';
import { AuthService } from './auth.service';

/**
 * @interface Note
 * @brief Represents a note entity in the application.
 */
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  pendingSync?: boolean;
  encrypted?: boolean;
}

/**
 * @class NoteService
 * @brief Provides methods for adding, retrieving, and managing notes (both locally and in Firebase).
 */
@Injectable({ providedIn: 'root' })
export class NoteService {
  /**
   * @brief Reference to the "notes/" path in Realtime Database.
   */
  public notesRef: any;

  /**
   * @brief Promise that resolves once Ionic Storage is initialized.
   */
  private storageInitialized: Promise<Storage>;

  /**
   * @brief Constructor initializing storage and DB references.
   * @param storage The Ionic Storage instance.
   * @param db The AngularFire Database service.
   * @param authService Authentication service for getting encryption keys and user info.
   */
  constructor(
    private storage: Storage,
    private db: Database,
    private authService: AuthService
  ) {
    this.storageInitialized = this.initStorage();
    this.notesRef = ref(this.db, 'notes/');
  }

  /**
   * @function initStorage
   * @brief Initializes the Ionic Storage system.
   * @return A promise resolving to the created Storage instance.
   */
  async initStorage(): Promise<Storage> {
    try {
      const store = await this.storage.create();
      console.info('Storage initialized with driver:', this.storage.driver);
      return store;
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw new Error('Failed to initialize storage');
    }
  }

  /**
   * @function getKey
   * @brief Retrieves the encryption key from AuthService or throws an error if not authenticated.
   * @return The encryption key string.
   */
  private getKey(): string {
    const key = this.authService.getEncryptionKey();
    if (!key) throw new Error('User not authenticated');
    return key;
  }
  
  /**
   * @function encrypt
   * @brief Encrypts note content using AES with the current user's encryption key.
   * @param content The plaintext content to encrypt.
   * @return Encrypted string in Base64 format.
   */
  async encrypt(content: string): Promise<string> {
    return CryptoJS.AES.encrypt(content, this.getKey()).toString();
  }

  /**
   * @function decrypt
   * @brief Decrypts note content using AES with the current user's encryption key.
   * @param ciphertext The encrypted content in Base64 format.
   * @return Decrypted plaintext string or '[Decryption error]' if decoding fails.
   */
  async decrypt(ciphertext: string): Promise<string> {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.getKey());
    return bytes.toString(CryptoJS.enc.Utf8) || '[Decryption error]';
  }

  /**
   * @function addNote
   * @brief Creates a new note (encrypted) in both the Realtime Database and local storage.
   * @param title Title of the note.
   * @param content Content of the note (to be encrypted).
   * @param userId The ID of the owner (logged-in user).
   */
  async addNote(title: string, content: string, userId: string): Promise<void> {
    await this.storageInitialized;
    if (!title || !content) throw new Error('Invalid note data');
  
    const encryptedContent = await this.encrypt(content);
    const note = {
      userId,
      title,
      content: encryptedContent,
      createdAt: new Date().toISOString(),
      pendingSync: false,
    };
  
    const newNoteRef = push(this.notesRef);
    const noteId = newNoteRef.key as string;

    await set(newNoteRef, note);
    await this.storage.set(noteId, note);
  }

  /**
   * @function getAllNotes
   * @brief Retrieves all notes for a given user from both local and cloud storage and merges them.
   * @param userId The ID of the logged-in user.
   * @return A sorted array of merged notes (newest first).
   */
  async getAllNotes(userId: string): Promise<Note[]> {
    await this.storageInitialized;
  
    if (navigator.onLine) {
      await this.syncOfflineChanges(userId);
    }
  
    const [localNotes, cloudNotes] = await Promise.all([
      this.getLocalNotes(userId),
      this.getCloudNotes(userId)
    ]);
  
    const filteredLocalNotes = localNotes.filter(note => note.userId === userId);
    const filteredCloudNotes = cloudNotes.filter(note => note.userId === userId);
  
    const cloudNoteIds = new Set(filteredCloudNotes.map(note => note.id));
    for (const note of filteredLocalNotes) {
      if (!note.pendingSync && cloudNoteIds.has(note.id)) {
        await this.storage.remove(note.id);
      }
    }
  
    const mergedNotes = this.mergeNotes([...filteredCloudNotes, ...filteredLocalNotes]);
  
    return mergedNotes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * @function getLocalNotes
   * @brief Retrieves notes from local Ionic Storage and decrypts them.
   * @param userId The ID of the logged-in user.
   * @return An array of locally stored and decrypted notes.
   */
  private async getLocalNotes(userId: string): Promise<Note[]> {
    const keys = await this.storage.keys();
    const notes = await Promise.all(
      keys.filter(key => key !== 'encryptionKey')
        .map(async key => {
          try {
            const note = await this.storage.get(key);
            if (!note || note.userId !== userId || !note.content) return null;
  
            const decryptedContent = await this.decrypt(note.content);
            return {
              id: key,
              userId: note.userId,
              title: note.title,
              content: decryptedContent,
              createdAt: note.createdAt,
              pendingSync: note.pendingSync ?? false,
            } as Note;
          } catch (error) {
            console.error(`Error processing note ${key}:`, error);
            return null;
          }
        })
    );
    return notes.filter((note): note is Note => note !== null);
  }

  /**
   * @function getCloudNotes
   * @brief Retrieves notes from the Realtime Database for the specified user and decrypts them.
   * @param userId The ID of the logged-in user.
   * @return An array of notes from the cloud.
   */
  private async getCloudNotes(userId: string): Promise<Note[]> {
    try {
      const snapshot = await get(this.notesRef);
      const notes: Note[] = [];
  
      if (snapshot.exists()) {
        const data = snapshot.val();
  
        const notePromises = Object.keys(data).map(async (key) => {
          const noteData = data[key];
          if (noteData.userId === userId) {
            const decryptedContent = await this.decrypt(noteData.content);
            return {
              id: key,
              userId: noteData.userId,
              title: noteData.title,
              content: decryptedContent,
              createdAt: noteData.createdAt,
            } as Note;
          }
          return null;
        });
  
        const resolvedNotes = await Promise.all(notePromises);
        return resolvedNotes.filter((note): note is Note => note !== null);
      }
  
      return [];
    } catch (error) {
      console.error('Error fetching cloud notes:', error);
      return [];
    }
  }

  /**
   * @function mergeNotes
   * @brief Merges local and cloud notes, ensuring the latest version of each note is used.
   * @param notes Array of notes (both local and cloud).
   * @return An array of unique notes.
   */
  private mergeNotes(notes: Note[]): Note[] {
    const unique = new Map<string, Note>();
    notes.forEach(note => {
      if (!unique.has(note.id) || new Date(note.createdAt) > new Date(unique.get(note.id)!.createdAt)) {
        unique.set(note.id, note);
      }
    });
    return Array.from(unique.values());
  }

  /**
   * @function syncOfflineChanges
   * @brief Pushes any pending local notes to the Realtime Database when online.
   * @param userId The ID of the logged-in user.
   */
  async syncOfflineChanges(userId: string): Promise<void> {
    const keys = await this.storage.keys();
  
    for (const key of keys) {
      if (key === 'encryptionKey') continue;
  
      const note = await this.storage.get(key);
      if (note && note.userId === userId && note.pendingSync) {
        try {
          const newNoteRef = this.notesRef.push();
          const newNoteId = newNoteRef.key as string;
  
          const noteToSync = await this.prepareNoteForSync(note);
  
          await this.notesRef.set(noteToSync);
          await this.storage.remove(key);
          await this.storage.set(newNoteId, { ...noteToSync, pendingSync: false });
        } catch (error) {
          console.error(`Error syncing offline note ${key}:`, error);
        }
      }
    }
  }

  /**
   * @function prepareNoteForSync
   * @brief Encrypts note content before uploading it to the cloud.
   * @param note The local note object.
   * @return A new object ready for cloud storage, with encrypted content.
   */
  private async prepareNoteForSync(note: any): Promise<any> {
    const encryptedContent = await this.encrypt(note.content);
    return {
      userId: note.userId,
      title: note.title,
      content: encryptedContent,
      createdAt: note.createdAt,
    };
  }

  /**
   * @function deleteNote
   * @brief Deletes a note by its ID from both local storage and the Realtime Database.
   * @param id The unique note ID to delete.
   */
  async deleteNote(id: string): Promise<void> {
    await this.storage.remove(id);
    await remove(child(this.notesRef, id));
  }

  /**
   * @function clearOfflineData
   * @brief Clears all data from Ionic Storage (used on logout).
   */
  async clearOfflineData(): Promise<void> {
    await this.storage.clear();
  }

  /**
   * @function cleanInvalidNotes
   * @brief Removes any invalid note entries that do not have proper structure.
   */
  async cleanInvalidNotes(): Promise<void> {
    const keys = await this.storage.keys();
    await Promise.all(
      keys.map(async key => {
        const note = await this.storage.get(key);
        if (!note?.content || !note.userId) {
          await this.storage.remove(key);
          console.info('Removed invalid note:', key);
        }
      })
    );
  }
}
