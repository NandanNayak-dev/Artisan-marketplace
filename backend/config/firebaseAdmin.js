const admin = require("firebase-admin");

try {
  const serviceAccount = require("../firebaseServiceAccount.json");

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.warn(
    "Firebase Admin is not configured. Google auth routes will be unavailable.",
  );
}

module.exports = admin;
