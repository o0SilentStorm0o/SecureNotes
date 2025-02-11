/**
 * @file firebase.service.ts
 * @brief Service to handle Firestore-based operations for users and notes.
 */

import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import * as CryptoJS from 'crypto-js';

/**
 * @interface UserData
 * @brief Interface for user data stored in Firestore.
 */
interface UserData {
  passwordHash: string;
  salt: string;
  userId: string;
  createdAt: any;
}

/**
 * @interface NoteData
 * @brief Interface for note data stored in Firestore.
 */
interface NoteData {
  userId: string;
  title: string;
  content: string;
  createdAt: any;
  id?: string;
}

/**
 * @class FirebaseService
 * @brief Provides operations for user registration, login, and note retrieval from Firestore.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  /**
   * @brief Constructor injecting the Firestore service.
   * @param firestore AngularFire Firestore service.
   */
  constructor(private firestore: Firestore) {}

  /**
   * @function register
   * @brief Registers a new user in Firestore if the username is not already taken.
   * @param username Chosen username (also used as document ID).
   * @param password Plaintext password to be salted and hashed.
   * @return A boolean promise that resolves to true if successful, otherwise false if user exists.
   */
  async register(username: string, password: string): Promise<boolean> {
    try {
      const userDoc = doc(this.firestore, `users/${username}`);
      const snapshot = await getDoc(userDoc);

      if (snapshot.exists()) {
        return false;
      }

      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const passwordHash = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 1000 }).toString();
      const userId = Date.now().toString();

      await setDoc(userDoc, {
        passwordHash,
        salt,
        userId,
        createdAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * @function login
   * @brief Attempts to authenticate a user by comparing password hash in Firestore.
   * @param username Username (document ID in Firestore).
   * @param password Plaintext password to be hashed and compared.
   * @return Object containing userId and salt if login successful, otherwise null.
   */
  async login(username: string, password: string): Promise<{ userId: string; salt: string } | null> {
    try {
      const userDoc = doc(this.firestore, `users/${username}`);
      const snapshot = await getDoc(userDoc);
      if (!snapshot.exists()) return null;

      const userData = snapshot.data() as UserData;
      if (!userData.salt) return null;
      
      const computedHash = CryptoJS.PBKDF2(password, userData.salt, { keySize: 256 / 32, iterations: 1000 }).toString();

      return userData.passwordHash === computedHash
        ? { userId: userData.userId, salt: userData.salt }
        : null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * @function getNotesByUserId
   * @brief Retrieves all notes for a user from the Firestore 'notes' collection, ordered by creation date desc.
   * @param userId The ID of the user to retrieve notes for.
   * @return An array of NoteData from Firestore.
   */
  async getNotesByUserId(userId: string): Promise<NoteData[]> {
    try {
      const notesCollection = collection(this.firestore, 'notes');
      const q = query(notesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as NoteData)
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }
}
