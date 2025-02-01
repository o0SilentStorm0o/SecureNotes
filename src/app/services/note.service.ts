import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';
import { Database, ref, push, set, get, remove } from '@angular/fire/database';
import { AuthService } from './auth.service';


export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  encrypted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NoteService {
  private storageInitialized: Promise<void>;
  private notesRef = ref(this.db, 'notes/');

  constructor(private storage: Storage, private db: Database, private authService: AuthService) {
    this.storageInitialized = this.initStorage()
  }

  async initStorage(): Promise<void> {
    try {
      await this.storage.create();
      console.log('Storage initialized with driver:', this.storage.driver);
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw new Error('Failed to initialize storage');
    }
  }

  private getKey(): string {
    const key = this.authService.getEncryptionKey();
    if (!key) throw new Error('User not authenticated');
    return key;
  }
  
  async encrypt(content: string): Promise<string> {
    return CryptoJS.AES.encrypt(content, this.getKey()).toString();
  }

  async decrypt(ciphertext: string): Promise<string> {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.getKey());
    return bytes.toString(CryptoJS.enc.Utf8) || '[Decryption error]';
  }

  async addNote(title: string, content: string, userId: string): Promise<void> {
    await this.storageInitialized;
    if (!title || !content) throw new Error('Invalid note data');
  
    const encryptedContent = await this.encrypt(content);
    const note = {
      userId,
      title,
      content: encryptedContent,
      createdAt: new Date().toISOString(),
    };
  
    const newNoteRef = push(this.notesRef);
    const noteId = newNoteRef.key as string;
  
    await set(newNoteRef, note);
  
    await this.storage.set(noteId, note);
  }

  async getAllNotes(userId: string): Promise<Note[]> {
    await this.storageInitialized;
  
    try {
      const [localNotes, cloudNotes] = await Promise.all([
        this.getLocalNotes(userId),
        this.getCloudNotes(userId)
      ]);
  
      const mergedNotes = this.mergeNotes([...localNotes, ...cloudNotes]);
  
      return mergedNotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Critical error retrieving notes:', error);
      return [];
    }
  }

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
              title: note.title,
              content: decryptedContent,
              userId: note.userId,
              createdAt: note.createdAt
            };
          } catch (error) {
            console.error(`Error processing note ${key}:`, error);
            return null;
          }
        })
    );
    return notes.filter((note): note is Note => note !== null);
  }

  private async getCloudNotes(userId: string): Promise<Note[]> {
    try {
      const snapshot = await get(this.notesRef);
      const notes: Note[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          if (data[key].userId === userId) {
            notes.push({
              id: key,
              userId: data[key].userId,
              title: data[key].title,
              content: data[key].content,
              createdAt: data[key].createdAt
            });
          }
        });
      }
      
      return notes;
    } catch (error) {
      console.error('Error fetching cloud notes:', error);
      return [];
    }
  }

  private mergeNotes(notes: Note[]): Note[] {
    const unique = new Map<string, Note>();
    notes.forEach(note => {
      if (!unique.has(note.id) || 
          new Date(note.createdAt) > new Date(unique.get(note.id)!.createdAt)) {
        unique.set(note.id, note);
      }
    });
    return Array.from(unique.values());
  }

  async deleteNote(id: string): Promise<void> {
    await this.storage.remove(id);
    
    const noteRef = ref(this.db, `notes/${id}`);
    await remove(noteRef);
  }

  async cleanInvalidNotes() {
    const keys = await this.storage.keys();
    await Promise.all(
      keys.map(async key => {
        const note = await this.storage.get(key);
        if (!note?.content || !note.userId) {
          await this.storage.remove(key);
          console.log('Removed invalid note:', key);
        }
      })
    );
  }
}
