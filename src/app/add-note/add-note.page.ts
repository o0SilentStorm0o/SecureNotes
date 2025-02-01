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
  note = { title: '', content: '' };
  titleFocused = false;
  contentFocused = false;
  isSaving = false;

  constructor(
    private noteService: NoteService,
    private authService: AuthService,
    private router: Router
  ) {}

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

  cancel() {
    this.router.navigate(['/home']);
  }

  clearForm() {
    this.note.title = '';
    this.note.content = '';
  }
}
