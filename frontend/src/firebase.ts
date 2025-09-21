// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUhPf6k-c3XAPFSH20NTgNsm1tOHZrJA8",
  authDomain: "ai-otbl-cms.firebaseapp.com",
  projectId: "ai-otbl-cms",
  storageBucket: "ai-otbl-cms.firebasestorage.app",
  messagingSenderId: "340612094870",
  appId: "1:340612094870:web:846bd944c3fdd2613d1bb7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
