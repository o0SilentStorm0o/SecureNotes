import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonInput } from '@ionic/angular/standalone';
import { NoteService } from './services/note.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonInput],
})
export class AppComponent implements OnInit {
  constructor(private noteService: NoteService) {}

  async ngOnInit() {
    try {
    } catch (error) {
      console.error('Fatal storage error:', error);
    }
  }
}
