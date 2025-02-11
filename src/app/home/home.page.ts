/**
 * @file home.page.ts
 * @brief Provides the main home page displaying existing notes.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  lockClosed,
  notificationsOutline,
  personCircleOutline,
  addOutline,
  calendarOutline,
  trashOutline,
  logOutOutline
} from 'ionicons/icons';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { NoteService } from '../services/note.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

addIcons({
  'lock-closed': lockClosed,
  'notifications-outline': notificationsOutline,
  'person-circle-outline': personCircleOutline,
  'add-outline': addOutline,
  'calendar-outline': calendarOutline,
  'trash-outline': trashOutline,
  'log-out-outline': logOutOutline
});

/**
 * @class HomePage
 * @brief Ionic page component that displays and manages notes for the logged-in user.
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TruncatePipe],
})
export class HomePage {
  /**
   * @brief Array of notes currently displayed.
   */
  notes: any[] = [];

  /**
   * @brief Indicates loading state.
   */
  isLoading = true;

  /**
   * @brief Optional error message when loading or manipulating notes.
   */
  errorMessage?: string;

  /**
   * @brief Internal storage for all notes fetched.
   */
  private allNotes: any[] = [];

  /**
   * @brief Constructor with required services and router.
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
   * @function ngOnInit
   * @brief Lifecycle method: loads notes after component initialization.
   */
  async ngOnInit() {
    await this.loadNotes();
    console.log('HomePage constructor/OnInit called');
  }

  /**
   * @function loadNotes
   * @brief Retrieves all notes for the logged-in user and updates internal arrays.
   */
  private async loadNotes() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Uživatel není přihlášen';
      this.isLoading = false;
      return;
    }
    try {
      this.isLoading = true;
      this.errorMessage = undefined;
      const notes = await this.noteService.getAllNotes(userId);
      this.allNotes = notes;
      this.notes = [...this.allNotes];
      if (this.notes.length === 0) {
        this.errorMessage = 'No notes found. Create your first note!';
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      this.errorMessage = 'Failed to load notes. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * @function searchNotes
   * @brief Filters notes based on a search query in their title or content.
   * @param event Search event with query data.
   */
  searchNotes(event: any) {
    const query = event.target.value.toLowerCase();
    this.notes = this.allNotes.filter((note) => {
      const titleMatch = note.title?.toLowerCase().includes(query);
      const contentMatch = note.content?.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  }

  /**
   * @function createNewNote
   * @brief Navigates to the AddNotePage.
   */
  async createNewNote() {
    await this.router.navigate(['/add-note']);
  }

  /**
   * @function refreshNotes
   * @brief Refreshes notes from the source (pull-to-refresh).
   * @param event The Ionic refresher event.
   */
  async refreshNotes(event: any) {
    await this.loadNotes();
    event.target.complete();
  }

  /**
   * @function deleteNote
   * @brief Deletes a specified note and reloads the list.
   * @param event The click event (to stop propagation).
   * @param note The note object to be deleted.
   */
  async deleteNote(event: Event, note: any) {
    event.stopPropagation();
    try {
      await this.noteService.deleteNote(note.id);
      await this.loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  /**
   * @function logout
   * @brief Clears offline data, logs out, and navigates back to the login page.
   */
  async logout() {
    try {
      await this.noteService.clearOfflineData();
      this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
