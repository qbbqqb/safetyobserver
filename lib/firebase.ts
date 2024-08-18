import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase config from env:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
console.log('Firebase initialized successfully. Firestore instance:', db);

const testSaveObservation = async () => {
  const testData = {
    location: 'Test Location',
    project: 'Test Project',
    company: 'Test Company',
    exactLocationDescription: 'Test Description',
    observationDetails: 'Test Details',
    actionsTaken: 'Test Actions',
    reporterName: 'Test Reporter',
  };

  console.log('Attempting to save test observation...');
  try {
    const docRef = await addDoc(collection(db, 'observations'), {
      ...testData,
      timestamp: new Date(),
      severityLevel: 'medium',
      category: 'general',
      attachments: [],
      isAnonymous: false,
    });
    console.log('Test observation saved successfully. Document ID:', docRef.id);
  } catch (error) {
    console.error('Error saving test observation:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

export { db, testSaveObservation };