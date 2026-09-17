import { App, cert, initializeApp } from "firebase-admin/app";
import { Auth, getAuth as getFirebaseAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { env } from "./env";

let app: App | undefined;

function hasCredentials(): boolean {
  return Boolean(env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey);
}

export function initializeFirebase(): App | undefined {
  if (app) return app;

  if (!hasCredentials()) {
    // Allows the API to boot locally (e.g. to hit /health) before Firebase
    // credentials are configured. Any route that touches Firestore will
    // throw via getDb()/getAuth() until real credentials are supplied.
    console.warn(
      "[firebase] FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set — " +
        "Firebase Admin SDK not initialized. Copy .env.example to .env and fill in your service account.",
    );
    return undefined;
  }

  app = initializeApp({
    credential: cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
    databaseURL: env.firebase.databaseURL,
  });

  return app;
}

function requireApp(): App {
  const initialized = app ?? initializeFirebase();
  if (!initialized) {
    throw new Error(
      "Firebase Admin SDK is not initialized. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, " +
        "and FIREBASE_PRIVATE_KEY in your .env file (see .env.example).",
    );
  }
  return initialized;
}

export function getDb(): Firestore {
  return getFirestore(requireApp());
}

export function getAuth(): Auth {
  return getFirebaseAuth(requireApp());
}
