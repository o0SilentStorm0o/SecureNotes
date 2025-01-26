import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private storageInitialized = false;
  private encryptionKey = 'initial-key';

  constructor(private storage: Storage) {}

  async initStorage() {
    if (!this.storageInitialized) {
      await this.storage.create();
      this.storageInitialized = true;
    }
  }

  async encrypt(content: string): Promise<string> {
    return CryptoJS.AES.encrypt(content, this.encryptionKey).toString();
  }

  async decrypt(ciphertext: string): Promise<string> {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}