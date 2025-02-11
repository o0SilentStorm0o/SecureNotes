import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Database } from '@angular/fire/database';
import { Firestore } from '@angular/fire/firestore';
import { createDatabaseMock } from './firebase-mocks.spec';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot(), RouterTestingModule, AppComponent],
      providers: [
        { provide: Database, useValue: createDatabaseMock() },
        { provide: Firestore, useValue: {} },
        { provide: 'REF_FN', useValue: (db: any, path: string) => createDatabaseMock().ref(path) }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
