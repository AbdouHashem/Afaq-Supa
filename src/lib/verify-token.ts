import { createRemoteJWKSet, jwtVerify } from 'jose';
import { firebaseConfig } from './firebase-config.ts';

// Verifies a Firebase ID token without firebase-admin. firebase-admin pulls in
// jwks-rsa (CommonJS) which require()s the ESM-only `jose`, and that crashes
// inside Vercel's serverless runtime (ERR_REQUIRE_ESM).
const JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
);

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
}

export async function verifyFirebaseIdToken(
  token: string,
  jwks: Parameters<typeof jwtVerify>[1] = JWKS,
  projectId: string = firebaseConfig.projectId
): Promise<VerifiedFirebaseUser> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ['RS256'],
  });
  if (!payload.sub) throw new Error('Firebase token has no subject');
  return {
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name : undefined,
  };
}
