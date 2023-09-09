// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyCKUehr-M0bDBggXhAUdrGHuIwD2HyiXZY",
	authDomain: "agenda-barberia.firebaseapp.com",
	projectId: "agenda-barberia",
	storageBucket: "agenda-barberia.appspot.com",
	messagingSenderId: "778423062315",
	appId: "1:778423062315:web:d19ca31995e751ab3fbf6e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };