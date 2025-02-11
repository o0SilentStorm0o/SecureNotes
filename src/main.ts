/**
 * @file main.ts
 * @brief Entry point for bootstrapping the SecureNotes application with Angular and Ionic.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { firebaseConfig } from './environments/firebase.config';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideIonicAngular } from '@ionic/angular/standalone';

/**
 * @brief Bootstraps the AppComponent with all required providers and modules.
 */
bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular({}),
    importProvidersFrom(
      BrowserModule,
      IonicModule.forRoot(),
      IonicStorageModule.forRoot({
        name: 'Database',
        driverOrder: ['sqlite', Drivers.IndexedDB, Drivers.LocalStorage],
      })
    ),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideRouter(routes),
  ],
});
