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
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TruncatePipe],
})
export class HomePage {
  notes: any[] = [];
  isLoading = true;
  errorMessage?: string;
  private allNotes: any[] = [];

  constructor(
    private noteService: NoteService,
    private authService: AuthService, 
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadNotes();
  }

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

  searchNotes(event: any) {
    const query = event.target.value.toLowerCase();
    this.notes = this.allNotes.filter((note) => {
      const titleMatch = note.title?.toLowerCase().includes(query);
      const contentMatch = note.content?.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  }

  async createNewNote() {
    await this.router.navigate(['/add-note']);
  }

  async refreshNotes(event: any) {
    await this.loadNotes();
    event.target.complete();
  }

  async deleteNote(event: Event, note: any) {
    event.stopPropagation();

    try {
      await this.noteService.deleteNote(note.id);
      await this.loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }
}
