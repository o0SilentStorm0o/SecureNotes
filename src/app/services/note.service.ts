import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class NoteService {
  constructor(private storage: Storage) {}

  async initStorage() {
    await this.storage.create();
  }

  async addNote(key: string, value: string): Promise<void> {
    await this.storage.set(key, value);
  }

  async getNotes(): Promise<{ [key: string]: any }> {
    const keys = await this.storage.keys();
    const notes: { [key: string]: any } = {};
    for (const key of keys) {
      notes[key] = await this.storage.get(key);
    }
    return notes;
  }
}
