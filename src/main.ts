// main.ts (Angular 15+ se standalone)
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      IonicModule.forRoot(),
      IonicStorageModule.forRoot({
        name: 'secureNotes',
        driverOrder: ['indexeddb', 'localstorage', 'websql']
      })
    ),
    provideRouter(routes),
  ],
});
