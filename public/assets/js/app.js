
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
if (localStorage.empresa=true) {

  var notificacion = firebase.database().ref('usuarios/'+localStorage.uid+'/respuestas/');
  notificacion.on('child_added', function(data) {
    console.log(data.val())
    $('#historial').prepend(`<a class="dropdown-item" href="#">Operador:${data.val().Operador}  <br>ya realizo el test <br> Fecha:${data.val().fecha }</a> <div class="dropdown-divider"></div>`);

    if (data.val().visto==false) {
      crearnotificacion( data.key, data.val().Operador, data.val().puntaje, data.val().fecha );

    }
 
});
 
}
function crearnotificacion(key , operador , puntaje , fecha) {
 
   ref=firebase.database().ref('usuarios/'+localStorage.uid+'/respuestas/'+key);
  ref.update( {
   visto:true
 });
  var timestamp = new Date().getUTCMilliseconds();
   
  let toast=`
  <div id="${timestamp}" data-delay="1900"  class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div  class="toast-header">
      <img src="assets/img/worker.png" style="width:20px; height: 20px;" class="rounded mr-2  w-10" alt="...">   
      <strong class="mr-auto">Test realizado</strong>
        <small class="text-muted">hace 1 segundo</small>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="toast-body">
         Operdador ${operador} realizo el test con puntaje ${puntaje}
      </div>
    </div>
   
   
   `
    $('#toasts').prepend(toast);
  $('#'+timestamp).toast('show');






}


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
            "extension": extension,
            "email": email,
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
              "email": email,
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
              localStorage.empresa=true;
              window.location = "admin.html";
            } else {
              if (resp.habilitado) {
                localStorage.empresa=true;
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
      })
      for (let j = 0; j < preguntasSize; j++) {
        console.log($('#p' + i + 'r' + j).val());
        console.log($('#p' + i + 'v' + j).val());
        firebase.database().ref('usuarios/' + localStorage.uid + '/cuestionario/pregunta' + i).push().set({
          'respuesta': $('#p' + i + 'r' + j).val(),
          'valor': $('#p' + i + 'v' + j).val(),
        })
      }
    }
    
      $('.wrapper').prepend(`
      <div id="cuestio" data-delay="1500" class="toast" style="position: absolute; top: 0; right: 0;">
      <div class="toast-header">
        <img src="assets/img/worker.png" style="width:20px; height: 20px;" class="rounded mr-2  w-10" alt="...">
        <strong class="mr-auto">operacion exitosa</strong>
        <small> hace 1 segundo</small>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="toast-body">
        Se agrego cuestionario con exito.
      </div>
    </div>
      `)
      $('#cuestio').toast('show');
       
    

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

function stringForm(titulo,nombre,email,direccion,mode) {
  let string = '';
  string += `
  <h2 class="text-center"><strong>${titulo}&nbsp;</strong>&nbsp;Operador.</h2>

  <div class="form-group"><input required value="${nombre}" class="form-control" type="text" id="nombreRepLeg" name="nombreRepLeg"
      placeholder="Nombre(s) y apellido(s)">
      <div class="valid-feedback">
          
        </div>
        <div class="invalid-feedback">
          debe ingresar nombre y apellido
        </div>
  </div>
  <div class="valid-feedback">
       
    </div>
    <div class="invalid-feedback">
      Ingrese Nombre y apellido.
    </div>
    `
    if (mode === 0){
      string += `<div class="form-group"><input  required class="form-control" type="email" id="email" name="nombreRepLeg"
      placeholder=" ingrese email">
      <div class="valid-feedback">
         
        </div>
        <div class="invalid-feedback">
          Ingrese formato de email valido
        </div>
      </div> 
      
      `
    }
  
  

  string += `<div class="container form-group">
      <div class="row">
          <div class="custom-file">
              <input  ${mode===0? 'required': ''} type="file" accept="image/gif,image/jpeg,image/jpg,image/png"  class="custom-file-input" id="file" lang="es">
              <label class="custom-file-label form-control" for="customFileLang">Seleccionar </label>
            </div>
            
        `

  
           

        if (mode === 0) {
         string += ` <div class="valid-feedback">
            
          </div>
          <div class="invalid-feedback">
            Debe selecionar un archivo Imagen debe ser formato gif,jpeg ,jpg,png
          </div>
          
          `
        }



   string += `  </div>

  </div>
  <div class="form-group"><input value="${direccion }" required class="form-control" type="text" id="direccion"
      placeholder="Dirección">
      <div class="valid-feedback">
          
        </div>
        <div class="invalid-feedback">
          Debe ingresar direccion
        </div>
  </div>
  
  ` 
  
  
  

  
  if (mode === 0) {
    string += `
    <div class="form-group"><input required
    minlength="6"class="form-control" id="password" type="password" name="password"
       placeholder="Contraseña">
       <div class="valid-feedback">
         
         </div>
         <div class="invalid-feedback">
           Debe ingresar Contraseña de minimo 6 caracteres
         </div>
</div>

    `

  }

  string += `
  <div class="form-group">
  <button class="btn btn-warning btn-block text-white"> 
      ${titulo}
  </button>
  </div>
  
  ` 

  return string;
}

function formCrearEditarOperador(){
  let form = document.getElementById('formulario');
  let mode = +localStorage.editMode;
  let string = '';
  var nombre;
  var email;
  var direccion;
  if (mode === 1){
    firebase.database().ref("usuarios/" + localStorage.editId).once('value', function (snapshot) {
      let resultado = snapshot.val();
      nombre = resultado.Nombre;
      email = resultado.email;
      direccion = resultado.direccion;

    }).then(function() {

      form.innerHTML += stringForm('Editar',nombre,email,direccion,1)
    })
  } else {
    form.innerHTML += stringForm('Crear','','','',0);
  }

}

function actualizarOp(event) {
  var files = event.target.file;
  firebase.database().ref('usuarios/' + localStorage.editId).update({
    "Nombre": $("#nombreRepLeg").val(),
    "direccion": $("#direccion").val(),
  });

  firebase.database().ref('usuarios/' + localStorage.uid +'/Operadores/' + localStorage.editKey).update({
    "Nombre": $("#nombreRepLeg").val(),
    "direccion": $("#direccion").val(),
  });

  // actualizar imagen
  if(files.files[0]){
    console.log('actualize imagen')
    let extensionBefore = '';
    firebase.database().ref('usuarios/' + localStorage.editId).once('value', function(snapshot){
      extensionBefore = snapshot.val().extension;
    }).then(function(){
      firebase.storage().ref('img/' + localStorage.editId + '.' + extensionBefore).delete().then(function() {
        // File deleted successfully
        let extension = files.files[0].name.split('.')[1];
        firebase.storage().ref('img/' + localStorage.editId + '.' + extension).put(files.files[0]);
      })
    })
  }



}

function guardarData(id,key, mode) {
  localStorage.editId = id;
  localStorage.editKey = key;
  localStorage.editMode = mode;
  window.location="crearEditarOperador.html";
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
  $('#toast2').toast('show');
  window.setInterval(function () {
    window.location = "listarOperadores.html";
  }, 2300);
}


function cargarGraficas() {
  let mybackgroundColor = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
  ];
  let myborderColor = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
  ];

  let nombreLabel = [];
  let dataOp = [];
  let cont = 0;
  let allAnswers=[];
  let body = document.getElementById('body');
  firebase.database().ref('usuarios/' + localStorage.uid).once('value', function (snapshot) {
    let respuestas = snapshot.val().respuestas;
    for (const r in respuestas) {
      firebase.database().ref('usuarios/' + r).once('value', function (snapshot2) {
        let resp = snapshot2.val();
        nombreLabel.push(resp.Nombre);
        body.innerHTML += `
          <div style="width:400px;height:400px; margin-right: 15px;margin-top:15px">
            <canvas id="${cont}" ></canvas>
          </div>
        `
        for (const key in resp.cuestionario.respuestas) {
          dataOp.push(resp.cuestionario.respuestas['' + key + '']);
        }
        allAnswers.push(dataOp);
        cont += 1;
      }).then(function () {
        for (let i = 0; i < cont; i++) {
          let ctx = document.getElementById('' + i);
          var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['pregunta 1', 'pregunta 2', 'pregunta 3', 'pregunta 4', 'pregunta 5'],
              datasets: [{
                label: nombreLabel[i], // nombres operadores
                data: allAnswers[i], // valor respuestas
                backgroundColor: mybackgroundColor,
                borderColor: mybackgroundColor,
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            }
          });
    
        }
      })

    }
  })
}

function loadInfoSideBar() {
  let email;
  let extension;
  let adminDiv = document.getElementById('adminInfo');
  firebase.database().ref('usuarios/' + localStorage.uid).once('value',function(snapshot){
    let respuesta = snapshot.val();
    console.log(respuesta);
    email = respuesta.email;
    extension = respuesta.extension;
  }).then(function() {
    console.log(email);
    console.log(extension);
    firebase.storage().ref('img/').child(localStorage.uid + '.' + extension).getDownloadURL().then(function (url) {
      console.log(url)
      src = "'" + url + "'";
      adminDiv.innerHTML += `
          <div class="">
              <div class="img" style="background-image: url(${src});"></div>
              <small>${email}</small>
          </div>
      
      
          `
    });
  });
}


// session();


