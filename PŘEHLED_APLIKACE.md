# SecureNotes - Rychlý přehled

## Co je SecureNotes?

SecureNotes je **bezpečná aplikace pro ukládání poznámek** s pokročilým šifrováním a offline podporou. Aplikace je vytvořena pomocí **Ionic Angular** frameworku a je určena pro web i mobilní zařízení.

## Hlavní funkce

### 🔐 Bezpečnost
- **AES šifrování** všech poznámek
- **PBKDF2 hashování** hesel s unikátními solemi
- **Client-side šifrování** - server nikdy nevidí nešifrovaná data

### 📱 Cross-platform
- **Webová aplikace** (běží v prohlížeči)
- **iOS aplikace** (pomocí Capacitor)
- **Android aplikace** (pomocí Capacitor)

### 🌐 Offline podpora
- **Lokální ukládání** poznámek
- **Automatická synchronizace** při obnovení připojení
- **Intelligent merging** lokálních a cloudových dat

### 🎨 Moderní UI
- **Ionic UI komponenty** pro nativní vzhled
- **Responsive design** pro všechny velikosti obrazovek
- **Dark/Light mode** podpora

## Jak to funguje?

### 1. Registrace/Přihlášení
```
Uživatel → Firebase Firestore → Zahashované heslo + Salt
```

### 2. Vytvoření poznámky
```
Poznámka → AES šifrování → Firebase + Lokální storage
```

### 3. Zobrazení poznámek
```
Firebase + Lokální storage → Merge → AES dešifrování → UI
```

## Technologie

| Kategorie | Technologie |
|-----------|-------------|
| **Frontend** | Ionic 8.4, Angular 19, TypeScript 5.6 |
| **Backend** | Firebase (Realtime DB + Firestore) |
| **Šifrování** | CryptoJS (AES + PBKDF2) |
| **Offline** | Ionic Storage |
| **Build** | Capacitor 7.0, Angular CLI |
| **Testing** | Jasmine, Karma |

## Struktura projektu

```
SecureNotes/
├── src/app/
│   ├── services/        # Business logika
│   │   ├── auth.service.ts      # Autentifikace
│   │   ├── note.service.ts      # Správa poznámek
│   │   └── firebase.service.ts  # Firebase komunikace
│   ├── home/           # Hlavní stránka
│   ├── login/          # Přihlášení
│   ├── register/       # Registrace
│   ├── add-note/       # Přidání poznámky
│   └── auth.guard.ts   # Ochrana tras
└── src/environments/   # Konfigurace
```

## Klíčové soubory

### Services (Služby)
- **`auth.service.ts`**: Správa přihlášení, generování šifrovacích klíčů
- **`note.service.ts`**: CRUD operace s poznámkami, šifrování/dešifrování
- **`firebase.service.ts`**: Komunikace s Firebase backendem

### Pages (Stránky)
- **`login.page.ts`**: Přihlašovací formulář
- **`home.page.ts`**: Seznam poznámek s vyhledáváním
- **`add-note.page.ts`**: Formulář pro nové poznámky
- **`register.page.ts`**: Registrační formulář

### Configuration (Konfigurace)
- **`firebase.config.ts`**: Nastavení Firebase projektu
- **`app.routes.ts`**: Definice tras aplikace
- **`auth.guard.ts`**: Ochrana autentifikovaných tras

## Bezpečnostní model

### Šifrování
1. **Uživatelský klíč**: `PBKDF2(username:password, salt, 1000 iterací)`
2. **Šifrování poznámky**: `AES(content, user_key)`
3. **Ukládání**: Pouze šifrovaná data v Firebase

### Autentifikace
1. **Heslo**: `PBKDF2(password, random_salt, 1000 iterací)`
2. **Session**: `userId + encryptionKey` v localStorage
3. **Logout**: Kompletní vymazání citlivých dat

## Výhody aplikace

### ✅ Pro uživatele
- Snadné používání s moderním UI
- Bezpečné ukládání citlivých informací
- Přístup offline i online
- Synchronizace mezi zařízeními

### ✅ Pro vývojáře
- Čistá modulární architektura
- Dobře zdokumentovaný kód
- Unit testy pro kritické funkce
- Cross-platform development

### ✅ Pro bezpečnost
- End-to-end šifrování
- Zero-knowledge architektura
- Bezpečné hashování hesel
- Client-side šifrování

## Příklady použití

### Osobní poznámky
- Deníkové zápisky
- Todo seznamy
- Důležité informace

### Citlivé údaje
- Hesla a přístupové kódy
- Osobní dokumenty
- Konfidenciální informace

### Profesní využití
- Pracovní poznámky
- Meeting notes
- Projektové informace

## Instalace a spuštění

### Development
```bash
npm install           # Instalace závislostí
ionic serve          # Spuštění dev serveru
```

### Build
```bash
ionic build          # Web build
npx cap add ios      # Přidání iOS platformy
npx cap open ios     # Otevření v Xcode
```

## Shrnutí

SecureNotes je **komplexní řešení** pro bezpečné ukládání poznámek, které kombinuje:

- 🛡️ **Vysokou úroveň bezpečnosti** (AES + PBKDF2)
- 📱 **Moderní uživatelské rozhraní** (Ionic UI)
- 🌐 **Cross-platform kompatibilitu** (Web + Mobile)
- ⚡ **Vysoký výkon** (Offline-first přístup)
- 🔧 **Kvalitní codebase** (TypeScript + Angular)

Aplikace je ideální pro každého, kdo potřebuje bezpečně uchovávat své poznámky s možností přístupu z různých zařízení.