# Detailní technická dokumentace SecureNotes

## Přehled architektury

SecureNotes implementuje vícevrstvou architekturu s jasným oddělením zodpovědností:

```
┌─────────────────────────────────────────┐
│           Prezentační vrstva            │
│  (Ionic Components + Angular Pages)     │
├─────────────────────────────────────────┤
│            Služební vrstva              │
│    (AuthService, NoteService, etc.)     │
├─────────────────────────────────────────┤
│           Datová vrstva                 │
│  (Firebase + Ionic Storage)             │
└─────────────────────────────────────────┘
```

## Analýza klíčových komponent

### 1. Autentifikační systém

#### AuthService - Bezpečnostní architektura
```typescript
// Generování šifrovacího klíče
generateEncryptionKey(username: string, password: string, salt: string): string {
  return CryptoJS.PBKDF2(`${username}:${password}`, salt, { 
    keySize: 256 / 32, 
    iterations: 1000 
  }).toString();
}
```

**Bezpečnostní vlastnosti:**
- **PBKDF2**: Použití 1000 iterací pro odolnost proti brute-force útokům
- **Salt**: Unikátní salt pro každého uživatele
- **Kombinace**: Uživ. jméno + heslo jako vstup pro větší entropii
- **256-bit klíč**: Silné šifrování

#### Session Management
- **Persistence**: localStorage pro uchovávání session
- **Auto-restore**: Automatické obnovení session při načtení aplikace
- **Bezpečné logout**: Kompletní vymazání citlivých dat

### 2. Systém správy poznámek

#### NoteService - Šifrovací mechanismus
```typescript
// AES šifrování s user-specific klíčem
async encrypt(content: string): Promise<string> {
  return CryptoJS.AES.encrypt(content, this.getKey()).toString();
}

async decrypt(ciphertext: string): Promise<string> {
  const bytes = CryptoJS.AES.decrypt(ciphertext, this.getKey());
  return bytes.toString(CryptoJS.enc.Utf8) || '[Decryption error]';
}
```

**Implementační detaily:**
- **AES šifrování**: Symetrické šifrování pro výkon
- **Error handling**: Graceful degradace při chybě dešifrování
- **Key derivation**: Každý uživatel má unikátní klíč

#### Dual Storage Pattern
```typescript
// Merge algoritmus pro spojení lokálních a cloudových dat
private mergeNotes(notes: Note[]): Note[] {
  const unique = new Map<string, Note>();
  notes.forEach(note => {
    if (!unique.has(note.id) || 
        new Date(note.createdAt) > new Date(unique.get(note.id)!.createdAt)) {
      unique.set(note.id, note);
    }
  });
  return Array.from(unique.values());
}
```

**Výhody tohoto přístupu:**
- **Offline-first**: Lokální data jako primární zdroj
- **Conflict resolution**: Timestamp-based řešení konfliktů
- **Performance**: Rychlý přístup k lokálním datům

### 3. Firebase integrace

#### FirebaseService - Backend komunikace
```typescript
// Bezpečná registrace s hashováním hesla
async register(username: string, password: string): Promise<boolean> {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const passwordHash = CryptoJS.PBKDF2(password, salt, { 
    keySize: 256 / 32, 
    iterations: 1000 
  }).toString();
  
  await setDoc(userDoc, {
    passwordHash,
    salt,
    userId: Date.now().toString(),
    createdAt: serverTimestamp()
  });
}
```

**Security features:**
- **Random salt**: 128-bit náhodný salt
- **Server timestamp**: Zabránění replay útokům
- **No plaintext**: Hesla nikdy neuložena v plain textu

## Offline synchronizační mechanismus

### Synchronizační strategie
1. **Write-through cache**: Zápis do lokálního storage i Firebase
2. **Eventual consistency**: Postupná synchronizace při připojení
3. **Conflict resolution**: Last-write-wins s timestamp

### Implementace offline režimu
```typescript
async syncOfflineChanges(userId: string): Promise<void> {
  const keys = await this.storage.keys();
  
  for (const key of keys) {
    const note = await this.storage.get(key);
    if (note && note.userId === userId && note.pendingSync) {
      // Synchronizace do Firebase
      await this.uploadToFirebase(note);
      // Cleanup lokálního storage
      await this.cleanupLocalStorage(key, note);
    }
  }
}
```

## UI/UX architektura

### Ionic komponenty a styling
- **Standalone components**: Moderní Angular architektura
- **Ion-cards**: Pro zobrazení poznámek
- **Ion-fab**: Floating action button pro přidání poznámky
- **Ion-refresher**: Pull-to-refresh funkcionalita
- **Ion-searchbar**: Vyhledávání v poznámkách

### Responsivní design
- **Mobile-first**: Optimalizováno pro mobilní zařízení
- **Cross-platform UI**: Jednotný vzhled na všech platformách
- **Adaptive layout**: Přizpůsobení různým velikostem obrazovek

## Bezpečnostní analýza

### Threat model
1. **Data at rest**: Šifrování v lokálním storage i Firebase
2. **Data in transit**: HTTPS komunikace s Firebase
3. **Authentication**: Silné hashování hesel
4. **Authorization**: Firebase security rules
5. **Client-side security**: Minimalizace citlivých dat v paměti

### Implementované countermeasures
```typescript
// Bezpečné vymazání citlivých dat
logout(): void {
  this.currentUserId = null;
  this.encryptionKey = null;
  localStorage.removeItem('currentUserId');
  localStorage.removeItem('encryptionKey');
}
```

### Potenciální zranitelnosti
1. **localStorage exposure**: Citlivá data v browser storage
2. **Memory dumps**: Klíče v paměti během běhu aplikace
3. **Side-channel attacks**: Timing attacks na šifrování
4. **Device theft**: Fyzický přístup k zařízení

## Performance optimalizace

### Lazy loading
- **Route-based splitting**: Každá stránka je samostatný chunk
- **Component lazy loading**: Import komponent dle potřeby
- **Tree shaking**: Odstranění nepoužívaného kódu

### Caching strategie
```typescript
// Inteligentní cache management
private async getLocalNotes(userId: string): Promise<Note[]> {
  const keys = await this.storage.keys();
  // Paralelní zpracování pro lepší výkon
  const notes = await Promise.all(
    keys.map(async key => this.processNote(key, userId))
  );
  return notes.filter(note => note !== null);
}
```

## Testing strategie

### Unit testy
- **Service testing**: Testování business logiky
- **Component testing**: UI komponenty s mock daty
- **Integration testing**: Testování služeb s Firebase

### Testovací pokrytí
```typescript
// Příklad testu šifrování
it('should encrypt and decrypt content correctly', async () => {
  const originalContent = 'Test note content';
  const encrypted = await service.encrypt(originalContent);
  const decrypted = await service.decrypt(encrypted);
  
  expect(decrypted).toBe(originalContent);
  expect(encrypted).not.toBe(originalContent);
});
```

## Deployment architektura

### Build proces
1. **TypeScript compilation**: TS → JS transpilace
2. **Bundle optimization**: Tree shaking, minifikace
3. **Asset optimization**: Optimalizace obrázků, CSS
4. **Code splitting**: Lazy loading chunks

### Platform targets
- **Web**: PWA s service worker support
- **iOS**: Capacitor wrapper s nativními pluginy
- **Android**: Capacitor wrapper s nativními pluginy

## Monitoring a debugging

### Error handling
```typescript
// Centralizované error handling
try {
  await this.noteService.addNote(title, content, userId);
} catch (error) {
  console.error('Note creation failed:', error);
  this.showErrorMessage('Failed to save note');
}
```

### Logging strategie
- **Console logging**: Development environment
- **Error tracking**: Production error monitoring
- **Performance monitoring**: Load times, bundle sizes

## Scalability considerations

### Horizontal scaling
- **Firebase auto-scaling**: Automatické škálování backendu
- **CDN distribution**: Rychlé načítání statických assets
- **Client-side caching**: Snížení server load

### Vertical scaling
- **Lazy loading**: Načítání pouze potřebných modulů
- **Virtual scrolling**: Pro velké seznamy poznámek
- **Background sync**: Asynchronní synchronizace

## Závěr

SecureNotes představuje well-architected aplikaci s důrazem na:

1. **Security by design**: End-to-end šifrování jako core feature
2. **Offline-first approach**: Robustní offline funkcionalita
3. **Modern web standards**: Využití nejnovějších Angular/Ionic features
4. **Maintainable codebase**: Čistá architektura s separation of concerns
5. **Cross-platform compatibility**: Jediný codebase pro web i mobile

Aplikace demonstruje best practices pro vývoj secure mobile aplikací s híbrídním přístupem.