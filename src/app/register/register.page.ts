import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

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
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

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

  goBack() {
    this.router.navigate(['/login']);
  }
}
