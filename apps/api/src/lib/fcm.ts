import { env } from "./env";
import { logger } from "./logger";

import type { App } from "firebase-admin/app";
let fbApp: App | null = null;

async function initApp(): Promise<boolean> {
  if (fbApp) return true;
  if (!env.FCM_SERVICE_ACCOUNT_PATH) {
    logger.warn("FCM_SERVICE_ACCOUNT_PATH not set — push notifications disabled");
    return false;
  }
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    if (getApps().length === 0) {
      fbApp = initializeApp({ credential: cert(env.FCM_SERVICE_ACCOUNT_PATH) });
    } else {
      fbApp = getApps()[0]!;
    }
    logger.info("Firebase Admin SDK initialized");
    return true;
  } catch (error) {
    logger.error({ error }, "Failed to initialize Firebase Admin SDK");
    return false;
  }
}

export async function sendPushNotification(
  token: string,
  title: string,
  body?: string,
): Promise<void> {
  const ready = await initApp();
  if (!ready) return;
  try {
    const { getMessaging } = await import("firebase-admin/messaging");
    await getMessaging().send({ token, notification: { title, body: body ?? "" } });
    logger.info({ token: token.slice(0, 16) + "..." }, "Push notification sent");
  } catch (error) {
    logger.error({ error, token: token.slice(0, 16) + "..." }, "Failed to send push notification");
  }
}

export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body?: string,
): Promise<void> {
  const { db } = await import("./db");
  const { users } = await import("../db/schema/users");
  const { eq } = await import("drizzle-orm");
  const result = await db
    .select({ fcmToken: users.fcmToken })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const token = result[0]?.fcmToken;
  if (!token) return;
  await sendPushNotification(token, title, body);
}
