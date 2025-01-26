import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NoteService } from '../services/note.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
})
export class NotesPage {
  testInput = '';
  testResult = '';

  constructor(private noteService: NoteService) {}

  async testEncryption() {
    try {
      const encrypted = await this.noteService.encrypt(this.testInput);
      const decrypted = await this.noteService.decrypt(encrypted);
      
      this.testResult = `Encrypted: ${encrypted}\nDecrypted: ${decrypted}`;
    } catch (error) {
      this.testResult = `Error: ${error instanceof Error ? error.message : error}`;
    }
  }
}