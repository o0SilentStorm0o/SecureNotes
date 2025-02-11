import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      'ion-app',
      'ion-item',
      'ion-label',
      'ion-input',
      'ion-button',
      'ion-icon',
    ]
  }
});
