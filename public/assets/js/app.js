
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

var arrayOp = [];

function registrar(evt) {
  email = $("#email").val();
  password = $("#password").val();
  let extension = evt.target[5].files[0].name.split('.')[1];


  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function (user) {

      firebase.auth().signInWithEmailAndPassword(email, password)

        .then(function () {

          var user = firebase.auth().currentUser;

          user.sendEmailVerification().then(function () {
            window.location = "admin.html";
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

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          firebase.auth().currentUser.getIdToken().then(function (idToken) {
            localStorage.auth = idToken;
            localStorage.uid = firebase.auth().currentUser.uid;
          });
          var storage = firebase.storage().ref('img/' + firebase.auth().currentUser.uid + '.' + extension);
          storage.put(evt.target[5].files[0]);
          uid = firebase.auth().currentUser.uid;

          firebase.database().ref("usuarios/" + uid).set({
            "Empresa": $("#nombreEmp").val(),
            "NombreR": $("#nombreRepLeg").val(),
            "Telefono": $("#telRepLeg").val(),
            "documento": $("#numDoc").val(),
            "tipoD": $("#tipoD").val(),
            "Operadores": "lista de operadores",
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
  let extension = files.files[0].name.split('.')[1];



  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function () {



      if (firebase.auth().currentUser.uid) {


        var storage = firebase.storage().ref('img/' + firebase.auth().currentUser.uid + '.' + extension);
        storage.put(files.files[0]).then(
          function () {
            firebase.database().ref("usuarios/" + firebase.auth().currentUser.uid).set({
              "Nombre": $("#nombreRepLeg").val(),
              "direccion": $("#direccion").val(),
              "tipoUser": false,
              "empresa":localStorage.uid,
              "habilitado": true,
              "extension": extension
            }).then(function () {

              $('.toast').toast('show');
              window.setInterval(function () {
                window.location = "crearEditarOperador.html";
              }, 2300);





            }).catch(
              function (error) {

                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                console.log(errorMessage);

              }
            );
            firebase.database().ref("usuarios/" + localStorage.uid + "/Operadores").push().set(
              {
                "Nombre": $("#nombreRepLeg").val(),
                "direccion": $("#direccion").val(),
                "UID": firebase.auth().currentUser.uid
              }
            );

          }

        )
          .catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
          });



      }
    })
    .catch(function (error) {

      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);

    })

}

function iniciarSesion() {
  email = $("#email").val();
  password = $("#password").val();
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then( function () {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        firebase.auth().currentUser.getIdToken().then(function (idToken) {
          localStorage.auth = idToken;
          localStorage.uid = firebase.auth().currentUser.uid;
        });
  
        firebase.database().ref('usuarios/' + firebase.auth().currentUser.uid)
          .on('value', function (snapshot) {
            const resp = snapshot.val()
            if (resp.tipoUser) {
              window.location = "admin.html";
            } else {
              if (resp.habilitado) {
                window.location = "preguntas.html";
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'No estas habilitado para responder el cuestionario, dirijase con el administrador',
                })
              }
  
            }
          });
  
  
      }
    });
  
  })
  
  .catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error.message)
    let div = document.getElementById('error');
    $('#password').val("");
    $('#email').val("");
      div.innerHTML=`
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
  <strong>Operador!</strong> Credenciales invalidas.
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
      `;
    

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
    return firebase.database().ref('usuarios/' + userId + '/Operadores').once('value', function (snapshot) {
      let cont = 0;
      snapshot.forEach(function (childSnapshot) {

        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        let body = document.getElementById('body');
        let sw;
        let check = '';
        let extension = '';
        let src = '';
        let cuestionario
        firebase.database().ref("usuarios/" + childData.UID).once('value', function (snapshot) {
          sw = snapshot.val().habilitado;
          extension = snapshot.val().extension;
          console.log(extension);
          cuestionariobtn='';
          cuestionario=(snapshot.val().cuestionario!=null)?true:false;

        }).then(function () {
          firebase.storage().ref('img/').child(childData.UID + '.' + extension).getDownloadURL().then(function (url) {
            console.log(url)
            src = "'" + url + "'";
            body.innerHTML += `
          <div class="card d-flex justify-content-center"
          style="width: 18rem;margin-top: 20px;margin-right: 20px;">
          <img class="img  mx-auto d-block" style="margin-top: 5px;" src=${src}>
          <div class="card-body ">
              <div class="custom-control custom-radio" style="margin-left: 3px;">
                  <input type="checkbox" ${ check = sw ? 'checked' : ''} onclick="changeStatus(this)" id="${cont}" name="${cont}" class="custom-control-input">
                  <label class="custom-control-label fondo" for="${cont}">Habilitado</label>
              </div>
              <h5 class="card-title text-center text-justify">${childData.Nombre}</h5>
              <p class="card-text text-center text-justify" style="text-overflow: ellipsis;">${childData.direccion} </p>
                <div class="d-flex justify-content-center">

                <button id="${childData.UID}" name="${childKey}" onclick="guardarData(this.id,this.name,1)" class="btn btn-warning" style="margin-right: 5px;"> Editar  </button>
                <button id="${childData.UID}" name="${childKey}" onclick="eliminarOperador(this.id,this.name)" style="margin-right: 5px;" class="btn btn-danger">Eliminar </button>
                ${cuestionariobtn=  cuestionario?`<button id="${childData.UID}" name="${childKey}" onclick="openmodal(this.id, '${childData.Nombre}')" style="margin-right: 5px;" class="btn btn-secondary" style="margin-right: 5px;"> cuestionario  </button>`
                :''}
                </div>
              
              </div>
      </div>
          
          
          `
            arrayOp.push(childData.UID);
            cont += 1;
          }).catch(
            function () {
              src = 'assets/img/worker.png';
            }
          );


        });



        // ...
      });

      // ...
    })

  }

}

function changeStatus(div) {
  let hab;
  let id = arrayOp[+div.id];
  firebase.database().ref("usuarios/" + id).once('value', function (snapshot) {
    hab = !snapshot.val().habilitado;
  }).then(function () {
    firebase.database().ref("usuarios/" + id).update({ habilitado: hab })
  }
  );
}

function validarPregunta(pregunta) {
  const size = $('#d' + pregunta + ' ul li').length
  let errores = [];
  if (document.getElementById('e' + pregunta).value === '') {
    errores.push('enunciado vacio pregunta' + pregunta);
  }
  if (size === 0) {

    errores.push('pregunta' + pregunta + ' sin posibles respuestas');
  }
  for (let i = 0; i < size; i++) {
    if (document.getElementById('p' + pregunta + 'r' + i).value === '') {
      errores.push('pregunta' + pregunta + ' tiene una respuesta vacia');
    }

    if (document.getElementById('p' + pregunta + 'v' + i).value === '') {
      errores.push('pregunta' + pregunta + ' tiene un puntaje vacio');
    }
  }
  return errores;
}

function preguntas(event) { 
  let errores = [];
  for (let k = 1; k <= 5; k++) {
    let e = validarPregunta(k);
    if (e.length > 0){
      errores.push();
    }
  }
  if (errores.length > 0 ) {
    let Div=document.getElementById('error');
    Div.innerHTML = '';
    let stringError = `
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Advertencia!</strong> El cuestionario contiene algunos errores.
        

    `;
  
    for (let e = 0; e < errores.length; e++) {
      stringError+= `
          <p>- ${errores[e]} </p>
          
        `;
      
    }
  
    stringError += ` 
    <button type="button" style="color: black;" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    
    `;
    Div.innerHTML += stringError;
  } else {
    // firebase.database().ref('usuarios/' + localStorage.uid + '/cuestionario').remove()
    for (let i = 1; i <= 5; i++) {
      let enunciado = document.getElementById('e' + i).value;
      let preguntasSize = $('#d' + i + ' ul li').length;
      firebase.database().ref('usuarios/' + localStorage.uid + '/cuestionario/pregunta' + i).set({
        'enunciado': enunciado
      });
      for (let j = 0; j < preguntasSize; j++) {
        console.log($('#p' + i + 'r' + j).val());
        console.log($('#p' + i + 'v' + j).val());
        firebase.database().ref('usuarios/' + localStorage.uid + '/cuestionario/pregunta' + i).push().set({
          'respuesta': $('#p' + i + 'r' + j).val(),
          'valor': $('#p' + i + 'v' + j).val(),
        });
      }
    }
    

  }
}

function loadCuestionario() {
  let vacio = false;
  firebase.database().ref('usuarios/' + localStorage.uid).once('value', function(snapshot){
    let cuestionario = snapshot.val().cuestionario;
    if (cuestionario === null) {
      vacio = true;
    }
    let i = 1;
    for (const p in cuestionario) {
      let pregunta = document.getElementById('d' + i);
        pregunta.innerHTML = ` <label for="exampleInputEmail1">Pregunta numero: ${i}</label>
        <div class="form-inline">

            <input type="text" id="e${i}" value="${value = vacio? '': cuestionario[''+p+''].enunciado}" placeholder="Ingrese enunciado de la pregunta"
                class="form-control  "><button class="btn btn-warning" onclick="agregar('p${i}','d${i}')"> agregar opcion<i
                    class="fas fa-plus"></i></button>
        </div>

        <small id="emailHelp" class="form-text text-muted">Recuerde uso de una buena ortografia.</small>
        <ul  id="p${i}" class="list-group">
         
        </ul> 
        
        `
        let j = 0;
        for (const key in cuestionario[''+p+'']) {
          let respuesta = cuestionario[''+p+''][''+key+''].respuesta;
          let valor = cuestionario[''+p+''][''+key+''].valor;
          if(respuesta && valor ){

          
          var Div=document.getElementById('p'+i);
            Div.innerHTML+=`
          
                <li class="list-group-item" >
                    <div class="form-inline">

                        <input type="text" id=p${i}r${j} value="${respuesta}" placeholder="Ingrese Opcion de respuesta" class="form-control mr-3  w-65">
                        <input type="text" id=p${i}v${j} value="${valor}" placeholder="puntaje" class="form-control w-25">
                        <button class="btn btn-danger ml-3" onclick="quitar(this)"><i class="fas fa-minus-circle"></i></button>
                    </div>


                </li>


       
            
            `
            }
          j += 1;
        }
        // console.log(cuestionario[''+ [p] +'']);
        i += 1;
    } 
  });
}

function recoverPassword() {
  email = $("#email").val();
  div = document.getElementById('msg');
  firebase.auth().sendPasswordResetEmail(email).then(function() {
    div.innerHTML = '<small> Se ha enviado a tu correo un link para restablecer la contraseña</small>'
  }).catch(function(error) {
    // An error happened.
  });

}

function loadPerfil() {
  var perfil = document.getElementById('formulario');
  firebase.database().ref('usuarios/' + localStorage.uid ).once('value', function (snapshot) {
    
    respuesta = snapshot.val();
    perfil.innerHTML = `
    
                <h2 class="text-center">${respuesta.Empresa}</h2>
    
                <div class="form-group">
                    <p>Nombre del representante legal:</p>
                    <p class="form-control"  id="nombreRepLeg" name="nombreRepLeg"> ${respuesta.NombreR} </p>
                </div>

                <div class="form-group">
                    <p>Documento: </p>
                    <p class="form-control"  id="nombreRepLeg" name="nombreRepLeg"> ${respuesta.tipoD}: ${respuesta.documento}</p>
                </div>
                <div class="form-group">
                    <p>Correo: </p>
                    <p class="form-control"  id="nombreRepLeg" name="nombreRepLeg">${firebase.auth().currentUser.email}</p>
                </div>
                <div class="form-group">
                    <p>Telefono: </p>
                    <p class="form-control"  id="nombreRepLeg" name="nombreRepLeg">${respuesta.Telefono}</p>
                </div>

  `
  });

  let contOp = 0;
  firebase.database().ref('usuarios/' + localStorage.uid+ '/Operadores').once('value', function (snapshot) {
    
    snapshot.forEach(function (childSnapshot) {
      if (childSnapshot.val() !== 'lista de operadores'){
        console.log(childSnapshot.val()); 
        contOp += 1;
      }
      
    });
    console.log(contOp);
  }).then(function () {
    perfil.innerHTML += `
    <div class="form-group">
        <p>Cantidad de operadores: </p>
        <p class="form-control"  id="nombreRepLeg" name="nombreRepLeg">${contOp}</p>
    </div>
    
    `
  });

}

function eliminarOperador(id, key) {
  firebase.database().ref('usuarios/' + id).remove()
  firebase.database().ref('usuarios/' + localStorage.uid + '/Operadores/' + key).remve()
}

function guardarData(id,key, mode) {
  if(mode === 1){
    localStorage.editId = id;
    localStorage.editKey = key;
  }
  localStorage.editMode = mode;
}
function openmodal(id ,name) {
  let puntaje=0;
  let puntajes;
  idselected=id;
   
  firebase.database().ref('usuarios/'+id+'/cuestionario/respuestas').once( 'value', function (snapshot) {
    puntaje =snapshot.val().pregunta1+ snapshot.val().pregunta2+snapshot.val().pregunta3+snapshot.val().pregunta4+snapshot.val().pregunta5
    puntajes=snapshot.val();
  })
  .then(function () {
    $('#mbody').text(`su puntaje fue ${puntaje}`);
    $('#mtitle').text(`Operador:  ${name}`)
    $('#exampleModal').modal('show')
  })

}
function eliminarRes() {
  firebase.database().ref('usuarios/'+idselected+'/cuestionario').remove();
  $('#exampleModal').modal('hide')
  $('.toast').toast('show');
  window.setInterval(function () {
    window.location = "listarOperadores.html";
  }, 2300);
}


// session();


