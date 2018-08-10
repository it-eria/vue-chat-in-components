import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyAC6QK-sCeYF_X8HmM1oCCqhYwWeEFOakg',
  authDomain: 'test-chat-c8873.firebaseapp.com',
  databaseURL: 'https://test-chat-c8873.firebaseio.com',
  projectId: 'test-chat-c8873',
  storageBucket: 'test-chat-c8873.appspot.com',
  messagingSenderId: '670720421431'
})

// Export the database for components to use.
export const db = firebaseApp.database();
export const st = firebaseApp.storage();