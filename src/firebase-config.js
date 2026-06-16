const firebaseConfig = {
  apiKey: "AIzaSyBHlAfRnYv_12I_9O_exfgZWixYSNqdBEo",
  authDomain: "nk-dairy-products.firebaseapp.com",
  projectId: "nk-dairy-products",
  storageBucket: "nk-dairy-products.firebasestorage.app",
  messagingSenderId: "160950556427",
  appId: "1:160950556427:web:7425ff64ddb769ddf1740e"
};

if (window.firebase) {
  try {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }
  } catch (err) {
    console.error("Error initializing Firebase:", err);
  }
}

export default firebaseConfig;
