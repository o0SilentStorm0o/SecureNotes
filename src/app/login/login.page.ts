import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LoginPage {
  username = '';
  password = '';
  errorMessage = '';
  isHidden = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.isHidden = !this.router.url.includes('login');
    });
  }

  async login() {
    try {
      const success = await this.authService.login(this.username, this.password);
      
      if (success == true) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Neplatné přihlašovací údaje';
      }
    } catch (error) {
      this.errorMessage = 'Chyba přihlášení';
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
