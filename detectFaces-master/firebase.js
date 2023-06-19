import { initializeApp } from "firebase/app"
const firebaseConfig = {
    apiKey: "AIzaSyC4PquZPjluiAySVu0ym_5KN_5BqumssMI",
    authDomain: "pbl5-40150.firebaseapp.com",
    databaseURL: "https://pbl5-40150-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pbl5-40150",
    storageBucket: "pbl5-40150.appspot.com",
    messagingSenderId: "46238756492",
    appId: "1:46238756492:web:c761ab73eccc1b054555a9",
    measurementId: "G-RNVKD48HP1"
  }
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp