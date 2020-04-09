 
var firebaseConfig = {
  apiKey: "AIzaSyB6SazgRS61wd-YQpReItp_Y-qtEw91NyY",
  authDomain: "testonline-c7937.firebaseapp.com",
  databaseURL: "https://testonline-c7937.firebaseio.com",
  projectId: "testonline-c7937",
  storageBucket: "testonline-c7937.appspot.com",
  messagingSenderId: "472917740959",
  appId: "1:472917740959:web:7344c16d012919793381aa",
  measurementId: "G-4MQ5TWJRKC"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

  function registrar() {
    email = $("#email").val();
            password = $("#password").val();
      console.log(password);
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then( function (user) {
      firebase.auth().signInWithEmailAndPassword(email, password)
      
     .then( function () {

      var user = firebase.auth().currentUser;

      user.sendEmailVerification().then(function() {
        window.location="admin.html";
        // Email sent.
      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
     }

     ) 
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;

    });
    })
.catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log( errorCode);
        console.log(errorMessage);
        // ...
      });

  }
  function session(){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
       console.log("logeado");
       

      } else {
        console.log("no logeado");
      }
    });
  }
  function logout(params) {
    firebase.auth().signOut().then(function() {
       console.log("se salio el perro");
    }).catch(function(error) {
      // An error happened.
    });
  }
  session();
  
 
 