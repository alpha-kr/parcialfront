
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

function registrar(evt) {
  email = $("#email").val();
  password = $("#password").val();
  let extension=evt.target[5].files[0].name.split('.');

  
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function (user) {
      
      firebase.auth().signInWithEmailAndPassword(email, password)

        .then(function () {

          var user = firebase.auth().currentUser;

          user.sendEmailVerification().then(function () {
            // window.location = "admin.html";
            // Email sent.
          }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
          });
        }

        )
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;

        });

        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
              var storage=firebase.storage().ref('img/'+firebase.auth().currentUser.uid+'.'+extension);
              storage.put(evt.target[5].files[0]);
              uid = firebase.auth().currentUser.uid;
              
              firebase.database().ref("usuarios/" + uid).set({
                  "Empresa": $("#nombreEmp").val(),
                  "NombreR": $("#nombreRepLeg").val(),
                  "Telefono": $("#telRepLeg").val(), 
                  "documento": $("#numDoc").val(), 
                  "tipoD": $("#tipoD").val(), 
                  "Operadores":"lista de operadores",
                  "tipoUser": true, 
              });
          } 
      });
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      // ...
    });

}
function session() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log("logeado");


    } else {
      console.log("no logeado");
    }
  });
}
function crearoperadores(evt) {
  var files = evt.target.file;
  email = $("#email").val();
  password = $("#password").val();
  let extension=files.files[0].name.split('.');
  
 
  
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(){
   
     
     
    if (firebase.auth().currentUser.uid) {
      console.log("hola")
     
    var storage=firebase.storage().ref('img/'+firebase.auth().currentUser.uid+'.'+extension);
      storage.put(files.files[0]);
   
    
     firebase.database().ref("usuarios/" + firebase.auth().currentUser.uid).set({
        "Nombre": $("#nombreRepLeg").val(), 
        "direccion":$("#direccion").val(),
        "tipoUser": false, 
        "habilitado":true
    }).then(function () {
       
       $('.toast').toast('show');
       window.setInterval(function () {
        window.location="crearEditarOperador.html";
       }, 2300);
       

   
       

    }).catch(
      function(error){

        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    
      }
    ) ;
    firebase.database().ref("usuarios/" + localStorage.uid+"/Operadores").push().set(
      {
        "Nombre": $("#nombreRepLeg").val(), 
        "direccion":$("#direccion").val(),
        "UID":firebase.auth().currentUser.uid
      }
    );
    
    }   
  })
  .catch( function(error){

    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);

  })
 
}
 
function iniciarSesion() {
  email = $("#email").val();
  password = $("#password").val();
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;

  });
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      firebase.auth().currentUser.getIdToken().then(function (idToken) {
        localStorage.auth = idToken;
        localStorage.uid = firebase.auth().currentUser.uid;
      });

      firebase.database().ref('usuarios/' + firebase.auth().currentUser.uid)
        .on('value', function(snapshot) {
          const resp = snapshot.val()
          if( resp.tipoUser ) {
            window.location = "admin.html";
          } else {
            window.location = "preguntas.html";
          }
      });

      
    }
  });
}

function logout(params) {
  firebase.auth().signOut().then(function () {
    window.location = 'index.html';
    localStorage.clear();
  }).catch(function (error) {
    // An error happened.
  });
}
function operadores() {
  var userId = localStorage.uid;
  if (userId) {
    return firebase.database().ref('usuarios/' + userId+'/Operadores').once('value',function(snapshot) {
      let cont = 0;
      snapshot.forEach(function(childSnapshot) {
         
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        let body=document.getElementById('body');
        let sw;
        let check='';
        firebase.database().ref("usuarios/" + childData.UID).once('value' , function (snapshot){
          sw=snapshot.val().habilitado;
          console.log(sw);

        }).then(function(){
          body.innerHTML+=`
          <div class="card d-flex justify-content-center"
          style="width: 18rem;margin-top: 20px;margin-right: 20px;">
          <img class="img  mx-auto d-block" style="margin-top: 5px;" src="assets/img/worker.png">
          <div class="card-body ">
              <div class="custom-control custom-radio" style="margin-left: 3px;">
                  <input type="checkbox" ${ check =sw?'checked':''} id="customRadio${cont}" name="customRadio${cont}" class="custom-control-input">
                  <label class="custom-control-label fondo" for="customRadio${cont}">habilitado</label>
              </div>
              <h5 class="card-title text-center text-justify">${childData.Nombre}</h5>
              <p class="card-text text-center text-justify" style="text-overflow: ellipsis;">${childData.direccion} </p>
          </div>
      </div>
          
          
          `
          cont +=1;
        });
        
       
        
        // ...
      });

      // ...
    })
   
  }

}
// session();


