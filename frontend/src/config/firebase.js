import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyBAiQ5xN6IRJT4IoFujB67wQqCX7DB9kMM",
  authDomain: "ko-kart.firebaseapp.com",
  projectId: "ko-kart",
  storageBucket: "ko-kart.firebasestorage.app",
  messagingSenderId: "891382664804",
  appId: "1:891382664804:web:2fb0def04a45dffd3c1971",
  measurementId: "G-9N2KHGSQND"
};

const app = initializeApp(firebaseConfig);

const auth =getAuth(app)

export default auth;