import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { firebaseConfig } from './firebase-config.ts';

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
