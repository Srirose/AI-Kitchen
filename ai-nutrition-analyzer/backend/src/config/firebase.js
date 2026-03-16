const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require('../../firebase-service-account.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    console.log('Continuing without Firebase - using JWT only mode for development');
  }
};

const verifyFirebaseToken = async (token) => {
  try {
    if (!admin.apps.length) {
      return null;
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  admin
};
