import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserId: string | null = null;
  private encryptionKey: string | null = null;

  constructor(private firebaseService: FirebaseService) {}

  async login(username: string, password: string): Promise<boolean> {
    const userId = await this.firebaseService.login(username, password);
    
    if (userId) {
      this.currentUserId = userId;
      this.encryptionKey = this.generateEncryptionKey(username, password);
      console.log('Key generated after login:', this.encryptionKey);
      return true;
    }
    return false;
  }

  private generateEncryptionKey(username: string, password: string): string {
    try {
      return CryptoJS.PBKDF2(
        `${username}:${password}`,
        'school-project-salt',
        { keySize: 256 / 32 }
      ).toString();
    } catch (error) {
      console.error('Key generation error:', error);
      throw error;
    }
  }

  getUserId(): string | null {
    return this.currentUserId;
  }

  setUserId(userId: string): string | null {
    return this.currentUserId = userId;
  }

  getEncryptionKey(): string | null {
    return this.encryptionKey;
  }
}

