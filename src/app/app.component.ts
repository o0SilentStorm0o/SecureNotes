/**
 * @file app.component.ts
 * @brief The root component of the SecureNotes application, setting up the Ionic shell.
 */

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

/**
 * @class AppComponent
 * @brief Main application component that wraps the Ionic router outlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  /**
   * @brief Constructor of the AppComponent.
   */
  constructor() {}
}
