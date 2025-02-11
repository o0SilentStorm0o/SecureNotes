/**
 * @file add-note.page.ts
 * @brief Provides a page for adding a new note in the SecureNotes application.
 */

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NoteService } from '../services/note.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronBack, checkmarkCircle, hourglass, save } from 'ionicons/icons';

addIcons({ chevronBack, checkmarkCircle, hourglass, save });

/**
 * @class AddNotePage
 * @brief Ionic page component for creating new notes.
 */
@Component({
  selector: 'app-add-note',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './add-note.page.html',
  styleUrls: ['./add-note.page.scss']
})
export class AddNotePage {
  /**
   * @brief Object storing the title and content of the note to be added.
   */
  note = { title: '', content: '' };

  /**
   * @brief Indicates whether the title input is currently focused.
   */
  titleFocused = false;

  /**
   * @brief Indicates whether the content input is currently focused.
   */
  contentFocused = false;

  /**
   * @brief Indicates whether the note is currently being saved.
   */
  isSaving = false;

  /**
   * @brief Constructor that injects necessary services and Router.
   * @param noteService Service for note operations.
   * @param authService Service for authentication handling.
   * @param router Angular router for navigation.
   */
  constructor(
    private noteService: NoteService,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * @function save
   * @brief Saves the note for the logged-in user if valid.
   */
  async save() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User not logged in');
      return;
    }
  
    if (this.note.title && this.note.content) {
      this.isSaving = true;
      try {
        await this.noteService.addNote(
          this.note.title, 
          this.note.content, 
          userId
        );
        this.router.navigate(['/home']);
      } finally {
        this.isSaving = false;
      }
    }
  }

  /**
   * @function cancel
   * @brief Navigates back to the home page without saving.
   */
  cancel() {
    this.router.navigate(['/home']);
  }

  /**
   * @function clearForm
   * @brief Clears the note form fields.
   */
  clearForm() {
    this.note.title = '';
    this.note.content = '';
  }
}
