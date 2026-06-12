// ============================================================
// firebase-config.js
// Replace the values below with YOUR Firebase project config.
// How to get this:
//   1. Go to https://console.firebase.google.com
//   2. Create a project → Add a Web App
//   3. Copy the firebaseConfig object and paste here
// ============================================================

const firebaseConfig = {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId:             "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
