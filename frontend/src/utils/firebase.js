import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";

// Exact Firebase Web App configuration from aifactchecker
export const firebaseConfig = {
  apiKey: "AIzaSyCFh0NhN7ba6OuaDCkJi7EjfdX81Ge9NKM",
  authDomain: "fake-news-detec.firebaseapp.com",
  projectId: "fake-news-detec",
  storageBucket: "fake-news-detec.firebasestorage.app",
  messagingSenderId: "1019983208627",
  appId: "1:1019983208627:web:b82413cc65dc0e7e3110c6",
  measurementId: "G-5XGWP4Q58P"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Expose globally on window.fb matching aifactchecker's login.js
if (typeof window !== "undefined") {
  window.fb = {
    app,
    auth,
    googleProvider,
    githubProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
  };
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
};
