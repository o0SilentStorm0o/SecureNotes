import { TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Database } from '@angular/fire/database';
import { Firestore } from '@angular/fire/firestore';
import { createDatabaseMock } from '../firebase-mocks.spec';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot(), RouterTestingModule, HomePage],
      providers: [
        { provide: Database, useValue: createDatabaseMock() },
        { provide: Firestore, useValue: {} },
        { provide: 'REF_FN', useValue: (db: any, path: string) => createDatabaseMock().ref(path) }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomePage);
    const page = fixture.componentInstance;
    expect(page).toBeTruthy();
  });
});
