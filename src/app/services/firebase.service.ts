import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import * as CryptoJS from 'crypto-js';

interface UserData {
  passwordHash: string;
  userId: string;
  createdAt: any;
}

interface NoteData {
  userId: string;
  title: string;
  content: string;
  createdAt: any;
  id?: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  async register(username: string, password: string): Promise<boolean> {
    try {
      const userDoc = doc(this.firestore, `users/${username}`);
      const snapshot = await getDoc(userDoc);

      if (snapshot.exists()) {
        return false;
      }

      const passwordHash = CryptoJS.SHA256(password).toString();
      const userId = Date.now().toString();

      await setDoc(userDoc, {
        passwordHash,
        userId,
        createdAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<string | null> {
    const userDoc = doc(this.firestore, `users/${username}`);
    const snapshot = await getDoc(userDoc);
    if (!snapshot.exists()) return null;
  
    const userData = snapshot.data() as UserData;
    return userData.passwordHash === CryptoJS.SHA256(password).toString() 
      ? userData.userId 
      : null;
  }


  async getNotesByUserId(userId: string): Promise<NoteData[]> {
    try {
      const notesCollection = collection(this.firestore, 'notes');
      const q = query(notesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnap => {
        return {
          id: docSnap.id,
          ...(docSnap.data() as NoteData)
        };
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }
}
