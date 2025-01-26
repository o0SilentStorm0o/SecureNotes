import { Routes } from '@angular/router';
import { NotesPage } from './notes/notes.page';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./notes/notes.page').then(m => m.NotesPage),
  },
];
