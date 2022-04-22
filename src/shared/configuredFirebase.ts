import { initializeApp } from 'firebase/app'
import * as auth from 'firebase/auth'

let config = {
    apiKey: "AIzaSyBt5DsD6YG2naMDe2tsaZcOjL8G81dR8-c",
    authDomain: "elemento-apps.firebaseapp.com",
    projectId: "elemento-apps",
    storageBucket: "elemento-apps.appspot.com",
    messagingSenderId: "366833305772",
    appId: "1:366833305772:web:0e3465a555865dddc47709",
    measurementId: "G-0490YPMK1B"
}
const app = initializeApp(config)

const getAuth = () => auth.getAuth(app)

export {auth, getAuth}
