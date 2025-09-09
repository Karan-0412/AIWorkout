import type { CapacitorConfig } from '@capacitor/cli';
import path from 'path';   // add this

const config: CapacitorConfig = {
  appId: 'coorder.com',
  appName: 'Coorder',
  webDir: path.join(__dirname, 'dist'),  // now works
};

export default config;
