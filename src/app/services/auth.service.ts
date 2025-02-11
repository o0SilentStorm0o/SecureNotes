/**
 * @file auth.service.ts
 * @brief Manages user authentication and encryption key generation.
 */

import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import * as CryptoJS from 'crypto-js';

/**
 * @class AuthService
 * @brief Handles login, logout, and storing user session details.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * @brief The currently logged-in user's ID or null if not logged in.
   */
  private currentUserId: string | null = null;

  /**
   * @brief The encryption key derived for the current user or null if not logged in.
   */
  private encryptionKey: string | null = null;

  /**
   * @brief Constructor that attempts to restore session from localStorage.
   * @param firebaseService Firebase operations for user login data.
   */
  constructor(private firebaseService: FirebaseService) {
    this.currentUserId = localStorage.getItem('currentUserId');
    this.encryptionKey = localStorage.getItem('encryptionKey');
  }

  /**
   * @function login
   * @brief Logs in a user with given username and password, storing user session details if successful.
   * @param username The username to authenticate.
   * @param password The plaintext password to check.
   * @return A boolean promise that resolves to true if login is successful, false otherwise.
   */
  async login(username: string, password: string): Promise<boolean> {
    const loginData = await this.firebaseService.login(username, password);
    if (loginData) {
      this.currentUserId = loginData.userId;
      this.encryptionKey = this.generateEncryptionKey(username, password, loginData.salt);
      localStorage.setItem('currentUserId', this.currentUserId);
      localStorage.setItem('encryptionKey', this.encryptionKey);
      return true;
    }
    return false;
  }

  /**
   * @function generateEncryptionKey
   * @brief Generates a unique encryption key for the user based on username, password, and salt.
   * @param username The username.
   * @param password The plaintext password.
   * @param salt A unique salt from the Firestore record.
   * @return A derived encryption key string.
   */
  private generateEncryptionKey(username: string, password: string, salt: string): string {
    try {
      return CryptoJS.PBKDF2(`${username}:${password}`, salt, { keySize: 256 / 32, iterations: 1000 }).toString();
    } catch (error) {
      console.error('Key generation error:', error);
      throw error;
    }
  }

  /**
   * @function getUserId
   * @brief Retrieves the currently logged-in user's ID.
   * @return User ID string or null if not logged in.
   */
  getUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * @function getEncryptionKey
   * @brief Retrieves the current user's encryption key if logged in.
   * @return The encryption key string or null if not available.
   */
  getEncryptionKey(): string | null {
    return this.encryptionKey;
  }

  /**
   * @function logout
   * @brief Logs out the current user, clearing local storage and session variables.
   */
  logout(): void {
    this.currentUserId = null;
    this.encryptionKey = null;
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('encryptionKey');
  }
}
