import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0mERpkL_F94SRo4P4Cz-DNJQDkMtGrBI",
    authDomain: "slack-clone-react-shelly.firebaseapp.com",
    databaseURL: "https://slack-clone-react-shelly.firebaseio.com",
    projectId: "slack-clone-react-shelly",
    storageBucket: "slack-clone-react-shelly.appspot.com",
    messagingSenderId: "142717031787",
    appId: "1:142717031787:web:0069881d04de818e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;