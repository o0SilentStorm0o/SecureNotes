# Analýza aplikace SecureNotes

## Přehled aplikace

SecureNotes je hybridní mobilní/webová aplikace vytvořená pomocí Ionic Angular frameworku, která poskytuje bezpečné, šifrované úložiště poznámek s offline funkcionalitou. Aplikace umožňuje uživatelům vytvářet, ukládat a spravovat své poznámky s pokročilým šifrováním na straně klienta.

## Účel aplikace

Hlavním účelem aplikace SecureNotes je poskytování bezpečného prostředí pro ukládání osobních poznámek s následujícími funkcemi:

- **Bezpečné ukládání**: Všechny poznámky jsou šifrovány lokálně před odesláním do cloudu
- **Offline přístup**: Možnost pracovat s poznámkami i bez internetového připojení
- **Synchronizace**: Automatická synchronizace mezi lokálním a cloudovým úložištěm
- **Cross-platform**: Funguje v prohlížeči i jako nativní mobilní aplikace

## Technická architektura

### Frontend
- **Framework**: Ionic Angular 8.4.2 se standalone komponenty
- **Jazyk**: TypeScript 5.6.3
- **UI komponenty**: Ionic UI komponenty pro moderní vzhled
- **Routing**: Angular Router s lazy loading

### Backend
- **Firebase Realtime Database**: Pro ukládání šifrovaných poznámek
- **Firebase Firestore**: Pro uživatelské účty a autentifikační data
- **Ionic Storage**: Pro offline ukládání poznámek

### Bezpečnost
- **Šifrování**: AES šifrování pomocí CryptoJS knihovny
- **Klíčové derivace**: PBKDF2 s 1000 iteracemi
- **Hash hesel**: PBKDF2 s unikátními solemi
- **Lokální šifrování**: Poznámky jsou šifrovány před odesláním

## Struktura souborů a komponenty

### Hlavní služby (`src/app/services/`)

#### AuthService (`auth.service.ts`)
- **Účel**: Správa autentifikace uživatelů a generování šifrovacích klíčů
- **Funkce**:
  - `login()`: Přihlášení uživatele s ověřením hesla
  - `logout()`: Odhlášení a vymazání session dat
  - `generateEncryptionKey()`: Generování šifrovacího klíče pomocí PBKDF2
  - `getUserId()`: Získání ID aktuálního uživatele
  - `getEncryptionKey()`: Získání šifrovacího klíče

#### NoteService (`note.service.ts`)
- **Účel**: Správa poznámek včetně šifrování, ukládání a synchronizace
- **Funkce**:
  - `encrypt()` / `decrypt()`: AES šifrování/dešifrování obsahu
  - `addNote()`: Přidání nové poznámky (šifrované)
  - `getAllNotes()`: Získání všech poznámek s merge z lokálního a cloudového úložiště
  - `syncOfflineChanges()`: Synchronizace offline změn s cloudem
  - `deleteNote()`: Smazání poznámky
  - `clearOfflineData()`: Vymazání lokálních dat

#### FirebaseService (`firebase.service.ts`)
- **Účel**: Komunikace s Firebase backendem
- **Funkce**:
  - `register()`: Registrace nového uživatele s hash hesla
  - `login()`: Ověření přihlašovacích údajů
  - `getNotesByUserId()`: Získání poznámek z Firestore

### Stránky aplikace

#### LoginPage (`src/app/login/`)
- **Účel**: Přihlašovací formulář
- **Funkce**: Ověření uživatelských údajů a přesměrování na hlavní stránku

#### RegisterPage (`src/app/register/`)
- **Účel**: Registrační formulář pro nové uživatele
- **Funkce**: Vytvoření nového uživatelského účtu

#### HomePage (`src/app/home/`)
- **Účel**: Hlavní stránka zobrazující seznam poznámek
- **Funkce**:
  - Zobrazení všech uživatelových poznámek
  - Vyhledávání v poznámkách
  - Smazání poznámek
  - Pull-to-refresh funkcionalita
  - Navigace na stránku pro přidání poznámky

#### AddNotePage (`src/app/add-note/`)
- **Účel**: Formulář pro vytvoření nové poznámky
- **Funkce**: Zadání názvu a obsahu poznámky s následným uložením

### Zabezpečení aplikace

#### AuthGuard (`auth.guard.ts`)
- **Účel**: Ochrana tras před neautorizovaným přístupem
- **Funkce**: Kontrola přihlášení uživatele před přístupem k chráněným stránkám

### Konfigurace

#### Firebase konfigurace (`src/environments/firebase.config.ts`)
- **Účel**: Nastavení Firebase projektu
- **Obsahuje**: API klíče, URL databáze, project ID

#### Routing (`app.routes.ts`)
- **Účel**: Definice tras aplikace s lazy loading
- **Chráněné trasy**: `/home` a `/add-note` vyžadují autentifikaci

## Bezpečnostní vlastnosti

### Šifrování na straně klienta
- Všechny poznámky jsou šifrovány lokálně pomocí AES algoritmu
- Šifrovací klíč je odvozen z uživatelského jména, hesla a unikátního salt
- Firebase uchovává pouze šifrovaná data

### Bezpečné ukládání hesel
- Hesla jsou hashována pomocí PBKDF2 s 1000 iteracemi
- Každý uživatel má unikátní salt
- Hesla nejsou nikdy ukládána v plain textu

### Autentifikační mechanismus
- Session management pomocí localStorage
- Automatické odhlášení při zavření aplikace
- Ochrana tras pomocí AuthGuard

## Offline funkcionalita

### Dual storage systém
- **Ionic Storage**: Pro lokální cache poznámek
- **Firebase**: Pro cloudové úložiště a synchronizaci

### Synchronizační mechanismus
- Automatická synchronizace při obnovení internetového připojení
- Merge algorismus pro řešení konfliktů
- Značení poznámek čekajících na synchronizaci

## Technické závislosti

### Hlavní knihovny
- `@ionic/angular`: 8.4.2 - UI framework
- `@angular/fire`: 19.0.0 - Firebase integrace
- `crypto-js`: 4.2.0 - Šifrovací knihovna
- `@ionic/storage-angular`: 4.0.0 - Offline storage
- `firebase`: 11.2.0 - Firebase SDK

### Development nástroje
- `@angular/cli`: 19.1.5 - Build nástroje
- `typescript`: 5.6.3 - Programovací jazyk
- `eslint`: 9.16.0 - Linting
- `karma`: 6.4.0 - Testování

## Deployment možnosti

### Webová aplikace
- Spuštění pomocí `ionic serve`
- Build pro production pomocí `ng build`

### Mobilní aplikace
- iOS: Build pomocí Capacitor a Xcode
- Android: Build pomocí Capacitor a Android Studio

## Testování

Aplikace obsahuje unit testy pro:
- AuthService
- NoteService 
- Jednotlivé komponenty

Testy používají Jasmine framework s Karma test runner.

## Shrnutí

SecureNotes je dobře navržená aplikace pro bezpečné ukládání poznámek s důrazem na:

1. **Bezpečnost**: End-to-end šifrování, bezpečné hashování hesel
2. **Uživatelskou přívětivost**: Intuitivní Ionic UI, offline funkcionalita
3. **Technickou kvalitu**: Modulární architektura, TypeScript, unit testy
4. **Cross-platform kompatibilitu**: Web i mobilní platformy

Aplikace je vhodná pro uživatele, kteří potřebují bezpečně ukládat citlivé informace s možností přístupu z různých zařízení.