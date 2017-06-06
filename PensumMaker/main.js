/* 
NOMBRE: PensumMaker
VERSION: 1.0
DESCRIPCION: Creador interactivo de Pensum, para facilitar al interesado a saber los requisitos y prelaciones de cada materia escrito en javascript.
AUTOR: Alexander Chinea
FECHA: 06-06-2017
CONTRIBUIDORES: Alfred Castillo, Victor Noguera.
*/



var arrayMaterias = []; //Array que almacenara cada nueva materia

//Funcion constructora del objeto materia

function materia(nombre,requisito,td,selector) {
    this.nombre = nombre;
    this.requisitos = requisito;
    this.aprobada = 0;
    this.td = td || undefined;
    this.prelaciones = [];
    this.select = selector;
}// end Constructor materia

materia.prototype = { // En este prototipo incluyo los metodos que son comunes para cada materia.

	 prelacion: function (){ //Metodo que Permite agregar las materias que seran prelaciones (se ejecuta cada vez que se cree una nueva materia).
        var materia = this;
        for (var i = 0; i < materia.requisitos.length; i++){
            if (materia.requisitos[i].prelaciones.length != 0) {
                if ( materia.requisitos[i].prelaciones.indexOf(materia) == -1) {
                    materia.requisitos[i].prelaciones.push(materia);
                }
            } else {
                if ( materia.requisitos[i].prelaciones[0] != materia) {
                    materia.requisitos[i].prelaciones.push(materia);
                }
            }
        }
    },
    Desbloquear: function(){ // Metodo que permite comprobar si la materia cumple con los requisitos ( se ejecuta al darle Click al checkbox).
        var i, cont = 0;
        var materia = this;
        if (materia.select.checked){
            if (materia.requisitos[0] === undefined) {
                materia.aprobada = 1;
                materia.td.style.backgroundColor = "#fff579";
            }
            else {
                for (i = 0; i < materia.requisitos.length; i++) {
                    if (materia.requisitos[i].aprobada == 0 ){
                        alert("Te falta aprobar "+ materia.requisitos[i].nombre + ".");
                        materia.select.checked = false;
                    } else {
                        cont++;
                        if (cont == materia.requisitos.length){ // Si todas las materias Aprobadas 
                            materia.aprobada = 1;
                            materia.td.style.backgroundColor = "#fff579";
                            
                        }
                    }
                }
            }
        } else { //Este else se aplica cuando deseleccionamos el CheckBox y permite restaurar las propiedades de la materia y si es el caso tamien restaura todas las que la tengan como requisito.
            if (materia.prelaciones[0] === undefined) {
				materia.aprobada = 0;
                materia.td.style.backgroundColor = "white";  
            } else {
				materia.aprobada = 0;
                materia.td.style.backgroundColor = "white";
				for (var i = 0; i < materia.prelaciones.length; i++) { 
                    while (materia.prelaciones[i].td === undefined){
                        i++;
                    } 
                    materia.prelaciones[i].td.style.backgroundColor = "white";
                    materia.prelaciones[i].aprobada = 0;
                    materia.prelaciones[i].select.checked = false;
                }
            }
          }        
        }, 
    heredarRequisitos: function () {  
        var materia = this;
        for (var i = 0; i < materia.requisitos.length; i++ ) {
          if  (materia.requisitos[0] != undefined) {
              if (materia.requisitos[i].requisitos[0] != undefined) {
                  for (var j = 0; j < materia.requisitos[i].requisitos.length; j++) {
                    if(materia.requisitos.indexOf(materia.requisitos[i].requisitos[j]) == -1) { //Comprobamos que no este el reuisito para asi agregar.
                        materia.requisitos.push(materia.requisitos[i].requisitos[j]);
                    }
                  }
              }
          }
        }
    }
}


//Variables para controlar la tabla.

var arrayTh = document.getElementsByTagName("th");
var arrayTd = document.getElementsByTagName("td");
var arrayTr = document.getElementsByTagName("tr");

var tabla = document.getElementById("tabla") ;
var cuerpo = tabla.childNodes[3];
var contTh = 2;
var contTd = 2;
var periodo = "Trimestre "; // Que tipo de periodo.

//Funciones relacionadas a la expansion de la tabla.

function agregarFila() { 
 
    if (arrayTr.length <= 13){
        
var rowCount = tabla.rows.length;
var row = tabla.insertRow(rowCount-1);

    for (var i = 0; i < arrayTh.length-1; i ++) {
    
        var cell1 = row.insertCell(i);
        contTd++;
        cell1.id = "td"+ contTd;
        cell1.innerHTML= '<button type ="button" onclick="crearFormulario(this.parentNode);">+</button>';

        }
        
    } else {
        alert("No puedes agregar mas de 12 materias para un solo periodo.");
    }
}

function crearPeriodo() { // Crea Nueva Columna
    if (arrayTh.length <= 10) {
var  nuevoTh = document.createElement("th");
                nuevoTh.innerText = periodo + contTh;
                arrayTr[0].insertBefore(nuevoTh,document.getElementById("nuevoPeriodo") );
                contTh++;
    
    for (var i= 1; i< arrayTr.length ; i++) {
        
         if (i == (arrayTr.length-1)){
             
        } else {
            
            var  nuevoTd = document.createElement("td");
            contTd++;
            nuevoTd.id= "td"+ contTd;
                        nuevoTd.innerHTML = '<button type ="button" onclick="crearFormulario(this.parentNode);">+</button>';
                        arrayTr[i].appendChild(nuevoTd);
            }
        }
    } else {
        alert("No puedes agregar mas de 10 periodos.")
    }
}

//Funciones para crear Nuevo Objeto materia dinamicamente.

function seleccionados(lista) { //Funcin que recibe las materias y verifica cuales estan seleccionadas y devuelve los requisios de la Nueva materia
    var opciones = lista.options;
    var seleccionados = [];
         for (i=0;i<lista.options.length;i++) {
              if (opciones[i].selected == true ) {
                 seleccionados.push(opciones[i].valor);
                 }
              }
    return seleccionados;
         }

var x= 1, z= 0;
function crear(lista,nombre,td){
    var requisitos = seleccionados(lista); // manda la lista de materias para que verifique cales fueron seleccionadas.
    if (nombre === undefined || nombre == undefined || nombre == "") {
         
        alert("No has Ingresado el nombre de la nueva materia.");
        
    } else if (requisitos === undefined || requisitos.length == 0) {
        
        confirmar=confirm("¿Estas seguro de crear la materia sin requisitos?"); 
        
        if (confirmar) {  
        
            arrayMaterias.push(new materia (nombre,requisitos,td)); //Creamos y Agregamos la Nueva Materia al array.
            i = arrayMaterias.length - 1;//Nos posicionamos sobre esta nueva materia.
            alert("Materia Creada Satisfactoriamente");//avisamos de su creacion.
            arrayMaterias[i].select = devolverMateria(td,nombre,i);//Fin de creacion de materia.
			
			
			
            var nombreFormateado = nombre.toLowerCase().replace(/ /g, '');
            var p = document.createElement("p");
            p.id = "parrafo"+ x;
            
            if (contTd != 2) {
                p.innerHTML=  "var " + nombreFormateado + " = new materia ('"+nombre+"',[],document.getElementById('"+td.id+"'),document.getElementById('"+input.id+"'));</br>arrayMaterias.push("+nombreFormateado+");";
            }
            else {
                p.innerHTML=  "var " + nombreFormateado + " = new materia ('"+nombre+"',[],document.getElementById('td0'),document.getElementById('s0'));</br>arrayMaterias.push("+nombreFormateado+");";
            }
            document.getElementById("content").appendChild(p);
            }
        
    } else {
        
        arrayMaterias.push(new materia (nombre,requisitos,td)); //Creamos y Agregamos la Nueva Materia al array.
        i = arrayMaterias.length - 1; //Nos posicionamos sobre esta nueva materia.
        alert("Materia Creada Satisfactoriamente"); //avisamos de su creacion.
        arrayMaterias[i].heredarRequisitos();
		FixPrelacion (); //Actualizamos las prelacines de todas las materias.
        arrayMaterias[i].select = devolverMateria(td,nombre,i); //Fin de creacion de materia.
        
		var nombresMaterias = []; // Esta parte es la que genera texto que hasta ahora es la que me permite guardar los pensums que haga.
        
        for (var i = 0; i < requisitos.length; i++) {
            nombresMaterias.push(requisitos[i].nombre);
        }
        
        var nombresMateriaFor = nombresMaterias.toString().toLowerCase().replace(/ /g, '');
        var nombreFormateado = nombre.toLowerCase().replace(/ /g, '');
        var p = document.createElement("p");
        p.id = "parrafo"+ x;
        p.innerHTML=  "var " + nombreFormateado + " = new materia ('"+nombre+"',[" +nombresMateriaFor+ "],document.getElementById('"+td.id+"'),document.getElementById('"+input.id+"'));</br>arrayMaterias.push("+nombreFormateado+");";
        
        document.getElementById("content").appendChild(p);
        
    }
}

function cancelar(td){ // Regresa el TableDatacell al estado original.
    td.innerHTML="<button type ='button' onclick='crearFormulario(this.parentNode);'>+</button>";
}

function crearFormulario(td){ //Formulario para crear nueva materia.
    //Creamos elementos y asignamos valores a sus propiedades.
    td.innerHTML = ""; //limpiamos el contenido del datacell
    var form = document.createElement("form");
    var contenedor = document.createElement('div');
    contenedor.id = "contenedor";
    var p1 = document.createElement('p');
    p1.textContent = "Nombre";
    var input = document.createElement('input');
    input.name = 'nombreMateria';
    input.type = 'text';
    input.id = "in";
    var p2 = document.createElement('p');
    p2.textContent = "Materias Requisitos";
    var lista = document.createElement('select');
    lista.name = 'Seleccion';
    lista.multiple = true;
    lista.id = "lis";
    //Agrupamos en orden los elementos del Formulario
    contenedor.appendChild(p1);
    contenedor.appendChild(input);
    contenedor.appendChild(p2);
    contenedor.appendChild(lista);
    form.appendChild(contenedor);
    td.appendChild(form);     
	
	//Con este For Mostramos la lista de materias actual.
    for (var i = 0; i < arrayMaterias.length ; i++) {
        var opcion = document.createElement('option');
        opcion.valor = arrayMaterias[i];
        opcion.textContent = arrayMaterias[i].nombre;
        lista.appendChild(opcion);
    }
	// Estos Son los Botones para Aceptar la creacion de una nueva materia o Cancelarla.
	var span1 = document.createElement("span");
    span1.textContent = "Ok";
    span1.className = "span1"; 
    var span2 = document.createElement("span");
    span2.textContent = "Cancelar";
    span2.className = "span2";
    
    contenedor.appendChild(span1);
    contenedor.appendChild(span2);
    
	// Aqui Hacemos Uso de jquery para asignarle un evento a los botones.
	
    $('#contenedor').ready(function () {
    $("#contenedor").on("click", "span.span1", function(){
        crear(document.getElementById("lis"),document.getElementById("in").value,td)
    });
    $("#contenedor").on("click", "span.span2", function(){
    cancelar(td);
    });
    });
}

var contInput = 0; //Contador de CheckBoxs

function devolverMateria(td,nombre,i) { //Est funcion crea la nueva Datacell y regresa el Checkbox para guardarlo en la pripedad select de cada materia
    td.innerHTML = '<div id="contenedorx" onmouseover="ColorearRequisitos(arrayMaterias['+ i +']);" onmouseleave="descolorearRequisitos(arrayMaterias['+i+']);">'+ nombre +'<input type="checkbox" onclick="arrayMaterias['+ i +'].Desbloquear();"></div>';
    var input = td.firstChild.childNodes[1];
    input.id = "s"+contInput;
    contInput++;
    return input;
} 

function ColorearRequisitos(materia) { // Funcion que permite colorear cada materia que sea requisito o prelacion

    for (var i = 0; i < materia.requisitos.length; i++) {
        
        materia.requisitos[i].td.style.backgroundColor = "#fb635c";
    }
    if (materia.prelaciones.length != 0) {
        for (var i = 0; i < materia.prelaciones.length ; i++) {
            materia.prelaciones[i].td.style.backgroundColor = "#9de1fb";
        }
    }
}

function descolorearRequisitos(materia) { // Funcion que permite descolorear cada materia que sea requisito o prelacion.
    for (var i = 0; i < materia.requisitos.length; i++) {
        if (materia.requisitos[i].aprobada == true) {
            materia.requisitos[i].td.style.backgroundColor = "#fff579";
        } else {
        materia.requisitos[i].td.style.backgroundColor = "white";
        }
    }
    for (var i = 0; i < materia.prelaciones.length; i++) {
        if (materia.prelaciones[i].aprobada == true) {
			materia.prelaciones[i].td.style.backgroundColor = "#fff579";
		} else {
        materia.prelaciones[i].td.style.backgroundColor = "white";
		}
    }
}
function FixPrelacion (){ //Funcion que lo unico que hace es ejecutar el metodo prelacion () para todas las materias .
for (var i=0;i<arrayMaterias.length;i++){
	arrayMaterias[i].prelacion();
}
}
