import type { NextFunction, Request, Response } from 'express';
import { verifyFirebaseIdToken, type VerifiedFirebaseUser } from '../lib/verify-token.ts';
import { getOrCreateUser } from '../db/users.ts';
import { isUserAdmin } from '../db/roles.ts';

export interface AuthRequest extends Request {
  user?: VerifiedFirebaseUser;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرّح: يرجى تسجيل الدخول أولًا.' });
  }

  const token = authHeader.split('Bearer ')[1];

  let user: VerifiedFirebaseUser;
  try {
    user = await verifyFirebaseIdToken(token);
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'غير مصرّح: جلسة غير صالحة أو منتهية.' });
  }

  try {
    req.user = user;

    const email = user.email ?? `${user.uid}@users.afaq.local`;
    const name = user.name ?? email.split('@')[0] ?? 'مستخدم آفاق';
    await getOrCreateUser(user.uid, name, email);

    // Auto-promote configured admin emails (only if Firebase verified the email)
    const adminEmails = [
      'a.m.hashem20@gmail.com',
      ...(process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(',').map((s) => s.trim().toLowerCase())
        : []),
    ];

    if (user.email && user.emailVerified && adminEmails.includes(user.email.toLowerCase())) {
      const { userRoles } = await import('../db/schema.ts');
      const { db } = await import('../db/index.ts');
      await db
        .insert(userRoles)
        .values({ userId: user.uid, role: 'admin' })
        .onConflictDoUpdate({ target: userRoles.userId, set: { role: 'admin' } });
    }

    next();
  } catch (error) {
    console.error('Database error during auth:', error);
    return res.status(500).json({ error: 'تعذر الاتصال بقاعدة البيانات حاليًا.' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'غير مصرّح: يرجى تسجيل الدخول أولًا.' });
  }

  try {
    const isAdmin = await isUserAdmin(uid);
    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: 'غير مصرّح: هذه الصلاحية مخصصة للمشرفين فقط.' });
    }
    next();
  } catch (error) {
    console.error('Error verifying admin role:', error);
    return res
      .status(500)
      .json({ error: 'تعذر التحقق من صلاحيات المشرف حاليًا.' });
  }
};
