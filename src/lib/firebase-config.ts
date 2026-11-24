import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FirebaseConfig {
  projectId: string;
  storageBucket?: string;
}

let firebaseConfig: FirebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'evident-primer-zl37k',
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    'evident-primer-zl37k.firebasestorage.app',
};

try {
  const possiblePaths = [
    path.resolve(__dirname, '../../firebase-applet-config.json'),
    path.resolve(process.cwd(), 'firebase-applet-config.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      firebaseConfig = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  }
} catch {
  // Use default fallback config
}

export { firebaseConfig };
