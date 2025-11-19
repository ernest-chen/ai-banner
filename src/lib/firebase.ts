import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

let app: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

function getFirebaseApp() {
  if (!app && typeof window !== 'undefined') {
    // Only initialize on client side
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Only initialize if we have required config
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (error) {
        console.warn('Firebase client initialization failed:', error);
      }
    }
  }
  return app;
}

function getAuthInstance() {
  if (!authInstance) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      authInstance = getAuth(firebaseApp);
    }
  }
  return authInstance;
}

function getDbInstance() {
  if (!dbInstance) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      dbInstance = getFirestore(firebaseApp);
    }
  }
  return dbInstance;
}

function getStorageInstance() {
  if (!storageInstance) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      storageInstance = getStorage(firebaseApp);
    }
  }
  return storageInstance;
}

// Export lazy-initialized services (only initialize when accessed)
export const auth = (() => {
  // Return a proxy that initializes on first access
  let instance: ReturnType<typeof getAuth> | null = null;
  return new Proxy({} as ReturnType<typeof getAuth>, {
    get(_target, prop) {
      if (!instance) {
        instance = getAuthInstance();
        if (!instance) {
          throw new Error('Firebase Auth not initialized. Check your environment variables.');
        }
      }
      const value = instance[prop as keyof typeof instance];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return typeof value === 'function' ? (value as Function).bind(instance) : value;
    }
  });
})();

export const db = (() => {
  let instance: ReturnType<typeof getFirestore> | null = null;
  return new Proxy({} as ReturnType<typeof getFirestore>, {
    get(_target, prop) {
      if (!instance) {
        instance = getDbInstance();
        if (!instance) {
          throw new Error('Firestore not initialized. Check your environment variables.');
        }
      }
      const value = instance[prop as keyof typeof instance];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return typeof value === 'function' ? (value as Function).bind(instance) : value;
    }
  });
})();

export const storage = (() => {
  let instance: ReturnType<typeof getStorage> | null = null;
  return new Proxy({} as ReturnType<typeof getStorage>, {
    get(_target, prop) {
      if (!instance) {
        instance = getStorageInstance();
        if (!instance) {
          throw new Error('Firebase Storage not initialized. Check your environment variables.');
        }
      }
      const value = instance[prop as keyof typeof instance];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return typeof value === 'function' ? (value as Function).bind(instance) : value;
    }
  });
})();

// Initialize auth providers (these don't require Firebase app)
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export default getFirebaseApp();
