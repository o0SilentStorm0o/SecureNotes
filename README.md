# SecureNotes

SecureNotes is a simple Ionic + Angular application for creating and storing encrypted notes. It uses local storage (Ionic Storage + CryptoJS) for offline availability, and it also synchronizes data to Firebase’s Realtime Database. In addition, user accounts and logins are managed via Cloud Firestore, allowing for basic username/password authentication.

## Key Features

- **User Authentication**  
  - Uses a Firestore-based approach for storing usernames and SHA-256 hashed passwords.
  - Registration and login screens let you create an account and sign in securely.

- **Encrypted Notes**  
  - Each note is encrypted locally with AES (via CryptoJS) before being stored or sent to Firebase.
  - The encryption key is itself saved in Ionic Storage, so the actual note content remains protected.

- **Offline & Online Storage**  
  - Saves notes in local storage (IndexedDB, LocalForage, etc.) for offline availability.
  - Also syncs each note to Firebase Realtime Database to back up data across sessions/devices.

- **CRUD Operations**  
  - Create new notes with a title and content.  
  - Read/view note listings on the Home page.  
  - Update by simply re-saving or re-encrypting content.  
  - Delete notes both locally and in the database.

- **Search & Filtering**  
  - Home page includes a search bar to filter notes by title or content.

## Project Structure

- **/src/app**  
  - **services**  
    - `note.service.ts` manages encrypted note CRUD in local storage + Realtime Database.  
    - `firebase.service.ts` manages user registration/login in Firestore.  
  - **pages**  
    - `login`, `register`, `home`, `add-note` contain respective UI logic.  
- **Ionic/Angular**  
  - Uses standalone Angular 15 components (no `AppModule`).  
  - All route definitions in `app.routes.ts`.  
