import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { Firestore } from '@angular/fire/firestore';

describe('AuthService', () => {
  let authService: AuthService;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('FirebaseService', ['login']);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: FirebaseService, useValue: spy },
        { provide: Firestore, useValue: {} }
      ]
    });
    authService = TestBed.inject(AuthService);
    firebaseServiceSpy = TestBed.inject(FirebaseService) as jasmine.SpyObj<FirebaseService>;
  });

  it('should login and store session data in sessionStorage', async () => {
    const dummyLoginData = { userId: 'user123', salt: 'dummySalt' };
    firebaseServiceSpy.login.and.returnValue(Promise.resolve(dummyLoginData));

    const success = await authService.login('testuser', 'testpassword');
    expect(success).toBeTrue();
    expect(authService.getUserId()).toEqual('user123');
    expect(sessionStorage.getItem('currentUserId')).toEqual('user123');
  });

  it('should logout and remove sessionStorage data', () => {
    sessionStorage.setItem('currentUserId', 'user123');
    authService.logout();
    expect(authService.getUserId()).toBeNull();
    expect(sessionStorage.getItem('currentUserId')).toBeNull();
  });
});
