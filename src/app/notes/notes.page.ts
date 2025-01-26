import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';    // kvůli *ngFor atd.
import { IonicModule } from '@ionic/angular';      // kvůli ion-* komponentám

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule
    // + případně další, které potřebujete
  ],
})
export class NotesPage {
  notes: { id: string, content: string }[] = [];
  
  // Metoda, na kterou voláte (click)="viewNote(note)"
  viewNote(note: { id: string; content: string }) {
    console.log('Viewing note:', note);
  }
}
