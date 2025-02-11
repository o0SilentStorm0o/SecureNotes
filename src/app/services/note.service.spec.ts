import { TestBed } from '@angular/core/testing';
import { NoteService, Note } from './note.service';
import { Storage } from '@ionic/storage-angular';
import { Database } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { Firestore } from '@angular/fire/firestore';
import { createDatabaseMock } from '../firebase-mocks.spec';

describe('NoteService', () => {
  let noteService: NoteService;
  let storageSpy: jasmine.SpyObj<Storage>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    storageSpy = jasmine.createSpyObj('Storage', ['create', 'set', 'get', 'keys', 'remove', 'clear']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getEncryptionKey', 'getUserId']);
    authServiceSpy.getEncryptionKey.and.returnValue('dummy-key');

    storageSpy.create.and.returnValue(Promise.resolve(storageSpy));
    storageSpy.keys.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      providers: [
        NoteService,
        { provide: Storage, useValue: storageSpy },
        { provide: Database, useValue: createDatabaseMock() },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Firestore, useValue: {} },
        { provide: 'REF_FN', useValue: (db: any, path: string) => createDatabaseMock().ref(path) }
      ]
    }).compileComponents();

    noteService = TestBed.inject(NoteService);
    await noteService['storageInitialized'];
  });

  it('should be created', () => {
    expect(noteService).toBeTruthy();
  });

  it('should encrypt and decrypt content correctly', async () => {
    const originalText = 'Hello, world!';
    const encrypted = await noteService.encrypt(originalText);
    expect(encrypted).toBeTruthy();
    const decrypted = await noteService.decrypt(encrypted);
    expect(decrypted).toEqual(originalText);
  });

  it('should add a note and call storage.set with correct parameters', async () => {
    const title = 'Test Note';
    const content = 'Test Content';
    const userId = 'user123';

    await noteService.addNote(title, content, userId);
    expect(storageSpy.set).toHaveBeenCalled();
  });

  it('should simulate offline/online behavior in getAllNotes', async () => {
    const userId = 'user123';
    authServiceSpy.getUserId.and.returnValue(userId);

    const dummyNote: Note = {
      id: 'dummy1',
      userId,
      title: 'Offline Note',
      content: await noteService.encrypt('Offline Content'),
      createdAt: new Date().toISOString(),
      pendingSync: true,
    };
    storageSpy.keys.and.returnValue(Promise.resolve(['dummy1']));
    storageSpy.get.and.callFake((key: string) =>
      key === 'dummy1' ? Promise.resolve(dummyNote) : Promise.resolve(null)
    );
    spyOnProperty(navigator, 'onLine').and.returnValue(true);

    const notes = await noteService.getAllNotes(userId);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0].userId).toEqual(userId);
  });
});
