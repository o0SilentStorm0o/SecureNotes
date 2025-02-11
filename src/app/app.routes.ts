/**
 * @file app.routes.ts
 * @brief Defines the application routes for SecureNotes.
 */

import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

/**
 * @const routes
 * @brief The route configuration used by the router for lazy-loaded pages.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-note',
    loadComponent: () => import('./add-note/add-note.page').then(m => m.AddNotePage),
    canActivate: [AuthGuard]
  }
];
