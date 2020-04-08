importScripts('https://www.gstatic.com/firebasejs/7.13.2/firebase-app.js')
var firebaseConfig = {
    apiKey: "AIzaSyCoIwutsqJDIzJGJRsJF_SJkDbDL3vVPbI",
    authDomain: "front2parcial.firebaseapp.com",
    databaseURL: "https://front2parcial.firebaseio.com",
    projectId: "front2parcial",
    storageBucket: "front2parcial.appspot.com",
    messagingSenderId: "144302066826",
    appId: "1:144302066826:web:018b648e767f1612a4f173"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  function registrar() {
      let email=document.getElementById('email');
      let password=document.getElementById('password');
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
  }
 
 