// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'restaurant',
  webDir: 'build',
  server: {
    // Use HTTP origin so calls to http://192.168.150.87:8000 are not mixed content (dev only)
    androidScheme: 'http',
    // Allow cleartext within the WebView transport (dev only)
    cleartext: true,
  },
  android: {
    // If any HTTPS assets still load, this avoids mixed-content blocking (dev only)
    allowMixedContent: true,
  },
};

export default config;
