/**
 * @file register.page.ts
 * @brief Provides a page for new user registration.
 */

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

/**
 * @class RegisterPage
 * @brief Ionic page component for new user registration.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  /**
   * @brief Username input for registration.
   */
  username = '';

  /**
   * @brief Password input for registration.
   */
  password = '';

  /**
   * @brief Error message displayed if registration fails.
   */
  errorMessage = '';

  /**
   * @brief Constructor injecting FirebaseService and Router.
   * @param firebaseService Service handling registration.
   * @param router Angular router for navigation.
   */
  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  /**
   * @function onRegister
   * @brief Registers a new user if possible.
   */
  async onRegister() {
    try {
      const success = await this.firebaseService.register(this.username, this.password);
      if (success) {
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'User already exists.';
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage = 'Registration failed. Please try again.';
    }
  }

  /**
   * @function goBack
   * @brief Navigates back to the login page.
   */
  goBack() {
    this.router.navigate(['/login']);
  }
}
