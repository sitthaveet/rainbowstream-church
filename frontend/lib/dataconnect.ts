import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getDataConnect,
  connectDataConnectEmulator,
  type DataConnect,
} from "firebase/data-connect";
import { connectorConfig } from "@dataconnect/generated";

/**
 * Server-side Data Connect handle shared by every API route handler.
 *
 * All connector operations are `@auth(level: PUBLIC)` — authorization is
 * enforced in the route handlers (see `lib/auth.ts`), so no auth token is
 * attached here.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Cache on globalThis so Next.js dev HMR does not re-run initializeApp (which
// throws on a duplicate app) or open duplicate Data Connect handles.
const globalForDc = globalThis as unknown as { __rscDataConnect?: DataConnect };

function createDataConnect(): DataConnect {
  const app: FirebaseApp = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);
  const instance = getDataConnect(app, connectorConfig);

  const emulatorHost = process.env.DATACONNECT_EMULATOR_HOST;
  if (emulatorHost) {
    const [host, port] = emulatorHost.split(":");
    connectDataConnectEmulator(instance, host, Number(port) || 9399, false);
  }
  return instance;
}

export const dc: DataConnect =
  globalForDc.__rscDataConnect ?? createDataConnect();

if (process.env.NODE_ENV !== "production") {
  globalForDc.__rscDataConnect = dc;
}
