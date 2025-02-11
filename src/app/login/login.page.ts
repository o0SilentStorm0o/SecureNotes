/**
 * @file login.page.ts
 * @brief Provides a page for user login.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';

/**
 * @class LoginPage
 * @brief Ionic page component for user login.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LoginPage implements OnInit {
  /**
   * @brief Username input for login.
   */
  username: string = '';

  /**
   * @brief Password input for login.
   */
  password: string = '';

  /**
   * @brief Error message displayed if login fails.
   */
  errorMessage: string = '';

  /**
   * @brief Flag to show or hide certain elements (not currently used).
   */
  isHidden: boolean = false;

  /**
   * @brief Constructor injecting services and router.
   * @param firebaseService Service for Firebase interactions.
   * @param authService Service for authentication handling.
   * @param router Angular router for navigation.
   */
  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * @function ngOnInit
   * @brief Clears form fields on component initialization.
   */
  ngOnInit(): void {
    this.clearForm();
  }

  /**
   * @function login
   * @brief Attempts user login using provided credentials.
   */
  async login() {
    try {
      const success = await this.authService.login(this.username, this.password);
      if (success) {
        this.clearForm();
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Neplatné přihlašovací údaje';
      }
    } catch (error) {
      this.errorMessage = 'Chyba přihlášení';
    }
  }

  /**
   * @function clearForm
   * @brief Clears the login form fields.
   */
  clearForm() {
    this.username = '';
    this.password = '';
  }

  /**
   * @function goToRegister
   * @brief Navigates to the user registration page.
   */
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
