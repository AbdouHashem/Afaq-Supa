import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseConfig: { projectId: string; storageBucket?: string } = {
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

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
    ...(firebaseConfig.storageBucket
      ? { storageBucket: firebaseConfig.storageBucket }
      : {}),
  });
}

export const adminAuth = getAuth();
export const adminStorage = getStorage();
export const firebaseStorageBucketName = firebaseConfig.storageBucket ?? '';
