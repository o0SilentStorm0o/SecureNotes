import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import * as CryptoJS from 'crypto-js';

/** Uživatelská data */
interface UserData {
  passwordHash: string;
  userId: string;
  createdAt: any;
}

/** Poznámka (pokud používáte i pro getNotesByUserId) */
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

  /**
   * Registrace nového uživatele
   * @param username - Jméno (klíč v "users/username")
   * @param password - Heslo pro SHA256
   * @returns true = úspěch, false = už existuje
   */
  async register(username: string, password: string): Promise<boolean> {
    try {
      // Odkaz na dokument "users/username"
      const userDoc = doc(this.firestore, `users/${username}`);
      const snapshot = await getDoc(userDoc);

      // Pokud už existuje, vracíme false
      if (snapshot.exists()) {
        return false;
      }

      // Vygenerujeme hash hesla a ID
      const passwordHash = CryptoJS.SHA256(password).toString();
      const userId = Date.now().toString();

      // Uložíme do Firestore
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

  /**
   * Přihlášení uživatele
   * @param username - Jméno (dokument v "users/username")
   * @param password - Heslo k porovnání
   * @returns true = úspěch (heslo sedí), false = selhání (neexistuje nebo hash nesedí)
   */
  async login(username: string, password: string): Promise<string | null> {
    const userDoc = doc(this.firestore, `users/${username}`);
    const snapshot = await getDoc(userDoc);
    if (!snapshot.exists()) return null;  // <-- vrátí null místo false
  
    const userData = snapshot.data() as UserData;
    return userData.passwordHash === CryptoJS.SHA256(password).toString() 
      ? userData.userId 
      : null;
  }


  /**
   * Načtení poznámek konkrétního uživatele
   * @param userId - ID uživatele
   * @returns Pole poznámek seřazených podle createdAt desc
   */
  async getNotesByUserId(userId: string): Promise<NoteData[]> {
    try {
      // Vytvoříme reference na kolekci "notes"
      const notesCollection = collection(this.firestore, 'notes');
      // Vytvoříme dotaz s where a orderBy
      const q = query(notesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));

      // Pro jednorázové načtení použijeme getDocs
      const snapshot = await getDocs(q);

      // Vrátíme pole s { id, userId, title, content, createdAt }
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
