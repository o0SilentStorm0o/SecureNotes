# SecureNotes

SecureNotes is a hybrid Ionic/Angular application for creating and managing encrypted notes. Users can register an account, log in, and store their notes securely in a Firebase backend (Firebase Realtime Database for notes, Firestore for user authentication data). The application supports offline storage and synchronization, providing a seamless user experience even in unstable network conditions.

---

## Table of Contents
1. [Key Features](#key-features)  
2. [Tech Stack](#tech-stack)  
3. [Prerequisites](#prerequisites)  
4. [Installation & Setup](#installation--setup)  
   - [Windows](#windows)  
   - [macOS](#macos)  
   - [Optional Global Installs](#optional-global-installs)
5. [Project Structure](#project-structure)  
6. [Usage](#usage)  
7. [Running on iOS Devices](#running-on-ios-devices)  
8. [Security Rules](#security-rules)  
9. [How It Works](#how-it-works)  
10. [Troubleshooting](#troubleshooting)  
11. [License](#license)

---

## Key Features
- **User Registration & Login**  
  Secure password handling with PBKDF2 hashing and salts stored in Firestore.
- **AES Encryption of Notes**  
  Each user’s note content is encrypted locally before being sent to Firebase.
- **Offline Support**  
  The app caches notes in Ionic Storage and syncs them with Firebase once back online.
- **Minimalistic UI**  
  Modern, card-based interface using Ionic’s UI components.
- **Cross-Platform**  
  Runs in the browser (via `ionic serve`), and can also be built for iOS/Android (via Capacitor).

---

## Tech Stack
- **Ionic (Angular framework)** for front-end
- **Firebase** (Realtime Database, Firestore) for data storage
- **CryptoJS** for AES encryption and PBKDF2 key derivation
- **Ionic Storage** for offline data
- **Capacitor** for building native iOS/Android

---

## Prerequisites

### 1. Node.js & npm
- **Node.js 14+** (preferably the latest LTS version).
- `npm` comes bundled with Node.

### 2. Ionic CLI
- Install globally (optional, but highly recommended).

### 3. Android Studio / Xcode (for native builds)
- If you want to build for **iOS**, you need **Xcode** on macOS.
- If you want to build for **Android**, you need **Android Studio** and SDK platform tools.

### 4. Git (optional)
- For cloning this repository.

---

## Installation & Setup

### Windows
1. **Install Node.js**:  
   - Download from [nodejs.org](https://nodejs.org/) and run the installer.
2. **Install Ionic (CLI)** (optional but recommended):  
   ```bash
   npm install -g @ionic/cli
3. **Clone the repository** or download the source code.
4. **Install dependencies**: In the project root folder:
   ```bash
   npm install
   ```
5. **Configure Firebase**:  
   - Update the `firebaseConfig` in `src/environments/firebase.config.ts` with your own Firebase project keys and endpoints if necessary.

### macOS
1. **Install Homebrew** (optional) or just install Node.js from [nodejs.org](https://nodejs.org/).  
   ```bash
   brew install node
   ```
2. **Install Ionic (CLI)** (optional but recommended):
   ```bash
   npm install -g @ionic/cli
   ```
3. **Clone the repository** or download the source code.
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Configure Firebase** similarly by editing the config in `src/environments/firebase.config.ts`.

### Optional Global Installs
- **Capacitor** is included as a dependency, but you can also install its CLI globally if you prefer:
  ```bash
  npm install -g @capacitor/cli
  ```
- **Cordova** is not strictly required (we use Capacitor), but you can install it if you need certain plugins:
  ```bash
  npm install -g cordova
  ```

---

## Project Structure
```
SecureNotes/
 ├── src/
 │    ├── app/
 │    │    ├── home/          # Home page (list of notes)
 │    │    ├── login/         # Login page
 │    │    ├── register/      # Registration page
 │    │    ├── add-note/      # Page for creating a new note
 │    │    ├── services/      # AuthService, NoteService, FirebaseService
 │    │    ├── pipes/         # Custom pipes (e.g., truncate)
 │    │    ├── app.routes.ts  # App-wide routes
 │    │    ├── auth.guard.ts  # Guard to protect routes
 │    │    ├── app.component.ts
 │    └── main.ts
 ├── capacitor.config.ts
 ├── package.json
 ├── tsconfig.json
 ├── ionic.config.json
 └── ...
```

---

## Usage

1. **Run in the Browser**:
   ```bash
   # From the root directory
   ionic serve
   ```
   This will open [http://localhost:8100](http://localhost:8100) by default, serving the app live.

2. **Login & Register**:  
   - Register a new user with `username` and `password`.  
   - Upon success, the user can log in, create notes, etc.

3. **Create Notes**:  
   - After logging in, navigate to the Home page.  
   - Click the `+` FAB button to add a new note.  
   - Fill in title and content, then tap “Save Note.”

4. **Offline**:  
   - If the network fails, new notes will be stored offline and synchronized once the internet returns.

---

## Running on iOS Devices

If you want to run a **native iOS build** using Capacitor:

1. **Add the iOS platform** (only needed once):
   ```bash
   npx cap add ios
   ```
2. **Build the Ionic app**:
   ```bash
   ionic build
   ```
3. **Sync** changes to the iOS project:
   ```bash
   npx cap copy ios
   ```
4. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```
5. **Run on device** (needs iOS Developer Account or at least a free Xcode provisioning profile):  
   - In Xcode, select your device or simulator and tap the “Run” button.

> **Note**: On a real iOS device, ensure you have a valid profile set up, or are okay with a local signing certificate for debugging.

---

## Security Rules
- **Realtime Database**: The app uses a ruleset so that only authenticated users can read and write their own notes.  
- **Firestore**: For user registration and login data, the app checks that only authorized writes/reads occur.  

> In a production environment, do not leave rules open (i.e., do not use `allow read, write: if true;`). Instead, ensure only the correct user ID can access data.

---

## How It Works
- **AuthService** manages the current user session, storing `userId` and an encryption key in `localStorage`.
- **NoteService** handles reading/writing notes, with local AES encryption. Offline data goes into Ionic Storage; then the app syncs changes to Firebase when online.
- **FirebaseService** uses Firestore for user accounts (registration & login logic).
- The **AuthGuard** prevents access to `/home` and `/add-note` unless the user is logged in.

---

## Troubleshooting
- If you see `Missing or insufficient permissions`, check your **Firebase Security Rules**.  
- If icons don’t load, ensure you’re using valid Ionicons names or have them imported.  
- If you get warnings about **non-passive event listeners**, these are performance hints from Chrome. They won’t necessarily break your app.

---

## License
This project is provided as-is for demonstration or educational use. You may adapt or extend it according to your needs.

---

**Happy Coding!**  
Feel free to open issues or contribute suggestions if you have any ideas for improvement.
```

Hodně zdaru, Davide! Pokud budeš mít jakékoli další otázky nebo potřebuješ upřesnit detaily, neváhej se ozvat.
