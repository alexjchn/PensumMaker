/* 
NOMBRE: PensumMaker
VERSION: 2.0
DESCRIPCION: Creador interactivo de Pensum.
Facilita visualizar los requisitos y prelaciones de cada materia.
AUTOR: Alexander Chinea
FECHA: 06-06-2017
CONTRIBUIDORES: Alfred Castillo.
*/
const MAX_MATERIAS = 12
const MAX_PERIODO = 10
const PERIODO = "Trimestre"
var TABLA = null

class materia {
	constructor (nombre, td, selector) {
		if (!materia.objetos) materia.objetos = [this]
		else materia.objetos.push(this)
		this.nombre = nombre
		this.requisitos = []
		this.aprobada = 0
		this.td = td || undefined
		this.prelaciones = []
		this.select = selector
	}
}

materia.prototype.desbloquear = function () {
	let i, cont = 0, materia = this
	if (materia.select.checked) {
		if (!materia.requisitos[0]) {
			materia.aprobada = 1
			materia.td.className = "aprobada"
		} else {
			var porAprobar= "";
			materia.requisitos.forEach(function(req) {
				let materia = this
				if (!req.aprobada) {
					porAprobar+= `\n ${req.nombre}` 
					materia.select.checked = false
				} else {
					cont++
						if (cont == materia.requisitos.length) {
							materia.aprobada = 1;
							materia.td.className = "aprobada";
						}
				}},this)
				if(porAprobar != "") {
					alert(`Te falta aprobar: ${porAprobar}`)
				}
		}
	} else { //Este else se aplica cuando deseleccionamos el CheckBox y permite restaurar las propiedades de la materia y si es el caso tamien restaura todas las que la tengan como requisito.
		materia.aprobada = 0;
		materia.td.className = "normal";
		if (materia.prelaciones[0]) {
			materia.prelaciones.forEach(function (pre) {
				pre.td.className = "normal";
				pre.aprobada = 0;
				pre.select.checked = false;
			},materia)
		}
	}
}
materia.prototype.addReq = function (req) {
	if (req.length == 1) {
		if (this.requisitos.indexOf(req[0]) == -1) {
			this.requisitos.push(req[0])
			if (req[0].prelaciones.indexOf(this)) {
				req[0].prelaciones.push(this)
			}
			if(req[0].requisitos.length == 1) {
				this.addReq([req[0].requisitos[0]])
			} else if (req[0].requisitos.length > 1) {
				req[0].requisitos.forEach(function (e){
					this.addReq([e])
				},this)
			}
		}
	} else {
		req.forEach(function(req) {
			if (this.requisitos.indexOf(req) == -1) {
			this.addReq([req])
			}
		},this)
	}	
}
function init() {
	let contenedor = $("#contenedor")[0]
	let tabla_template = `
		<div class="table-responsive">
			<table  class="table table-sm table-striped" id="tabla">
				<caption>Pensum Maker v3</caption>
				<thead class="thead-dark">
					<th id="periodo">${PERIODO} 1</th>
					<th>
						<button type="button" class="btn btn-light" id="aggPeriodo" onclick="agregarPeriodo.bind(TABLA)()">+</button>
					</th>
				</thead>
				<tbody>
					<tr>
						<td id=td1>
							<button type="button" class="btn btn-dark" onclick="crearFormulario.bind(TABLA)(event)">+</button>
						</td>
					</tr>
					<tr>
						<td id=td2>
							<button type="button" class="btn btn-dark" id="aggFila" onclick="agregarFila.bind(TABLA)()">Agregar Fila</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>`
	contenedor.innerHTML = tabla_template
	TABLA = $("#tabla")[0]
    if (localStorage.getItem("materias")) {
		contenedor.innerHTML = localStorage.getItem("tabla")
		document.write("<script id='asd1' type = 'text/javascript'>"+ localStorage.getItem("materias") +"</script>")
		content.textContent = localStorage.getItem("materias")
	} 
	boton3.addEventListener("click",guardarPensum.bind());
	boton4.addEventListener("click",() => {localStorage.clear()});
	boton5.addEventListener("click", () => { content.style.display == "none" ? content.style.display = "block" : content.style.display = "none"  })
	boton6.addEventListener("click", crearArchivoJs);
}

//Funciones relacionadas a la tabla.

function agregarFila() {
	const tabla = this
	const rowCount = tabla.rows.length;
    if (rowCount <= MAX_MATERIAS +1) {

		let row = tabla.insertRow(rowCount - 1);
        for (let i = 0; i < tabla.rows[0].childElementCount - 1; i++) {
            const nuevoTd = row.insertCell(i);
			let contTd = tabla.getElementsByTagName("td").length
            nuevoTd.id = "td" + contTd
			addBoton(nuevoTd,"+",crearFormulario,tabla)
        }
    } else {
        alert(`No puedes agregar mas de ${MAX_MATERIAS} materias para un solo periodo.`);
    }
}
function agregarPeriodo() { // Crea Nueva Columna
	let tabla = this
	let tableHead = tabla.rows[0]
    if (tableHead.childElementCount <= MAX_PERIODO) {
        const nuevoTh = document.createElement("th")
		nuevoTh.className ="periodo"
		nuevoTh.innerHTML = `${PERIODO} ${tabla.rows[0].childElementCount}`;
        tableHead.insertBefore(nuevoTh, tableHead.lastElementChild);
       
        for (let i = 1; i <tabla.rows.length ; i++) {
            if (i != (tabla.rows.length - 1)) {
				const nuevoTd = tabla.rows[i].insertCell()
                nuevoTd.id = "td" + tabla.getElementsByTagName("td").length;
                addBoton(nuevoTd,"+",crearFormulario,tabla)
            } 
        }
    } else {
        alert(`No puedes agregar mas de ${MAX_PERIODO} periodos.`)
    }
}
function addBoton (padre,contenido,funcion,tabla) {
	const boton = document.createElement("button")
	boton.type = "button"
	boton.className = "btn btn-dark"
	boton.textContent = contenido
	boton.onclick = funcion.bind(tabla)
	padre.appendChild(boton)
	return boton
}
//Funciones para crear Nuevo Objeto materia dinamicamente.

function seleccionados(lista) {	//Funcin que recibe las materias y verifica cuales estan seleccionadas y devuelve los requisitos de la Nueva materia
	const opciones = lista.selectedOptions
	let seleccionados = []
	Array.from(opciones).forEach(e=>seleccionados.push(e.valor))
	return seleccionados
}

function crear(lista, nombre, td) {
    const requisitos = seleccionados(lista); // manda la lista de materias para que verifique cuales fueron seleccionadas.
    if (!nombre) {
      alert("No has Ingresado el nombre de la nueva materia.");
    } 
    else if (!requisitos[0]) {
		if (confirm("¿Estas seguro de crear la materia sin requisitos?")) {	
			let input = devolverMateria(td, nombre, requisitos)
			let nombreFormateado = nombre.toLowerCase().replace(/ /g, '');
			const p = document.createElement("p");
            p.innerHTML = `let ${nombreFormateado} = new materia ('${nombre}',$('#${td.id}')[0],$('#${input.id}')[0]);<br>`;
			document.getElementById("content").appendChild(p);
        }
	} else {
		let input = devolverMateria(td, nombre, requisitos)
        let nombresMaterias = []; // Esta parte es la que genera texto que hasta ahora es la que me permite guardar los pensums offline.
        requisitos.forEach( (e) => nombresMaterias.push(e.nombre))
        const nombresMateriaFor = nombresMaterias.toString().toLowerCase().replace(/ /g, '');
        const nombreFormateado = nombre.toLowerCase().replace(/ /g, '');
        const p = document.createElement("p");
		p.innerHTML = `let ${nombreFormateado} = new materia ('${nombre}',$('#${td.id}')[0],$('#${input.id}')[0]);<br>${nombreFormateado}.addReq([${nombresMateriaFor}]);<br>`;
        document.getElementById("content").appendChild(p);
    }
}

function crearFormulario(event) { //Formulario para crear nueva materia.
    //Creamos elementos y asignamos valores a sus propiedades.
    var td = event.target.parentNode;
	const template =  `
	<form>
		<div class="form-group">
			<label for="in">Nombre</label>
			<input type="text" class="form-control" id="in" placeholder="Nombre de la Materia">
		</div>
			<label for="lis">Materias Requeridas</label>
	</form>
	`
	td.innerHTML = template
    var lista = document.createElement("select")
	lista.id= "lis"
	lista.className = "chosen-select"
	lista.multiple = true
    //Agrupamos en orden los elementos del Formulario
	td.appendChild(lista)
    //Con creamos la lista de materias.
	if (materia.objetos){
		materia.objetos.forEach((e)=>{
		const opcion = document.createElement('option')
		opcion.valor = e
		opcion.textContent = e.nombre
		lista.appendChild(opcion)
	})
	}
	$(".chosen-select").chosen({width: "100%"})
    // Estos Son los Botones para Aceptar la creacion de una nueva materia o Cancelarla.
    let botones = document.createElement("div")
	botones.className ="pt-1 d-flex justify-content-around"
	let span1 = document.createElement("button")
    span1.className="btn btn-success"
	span1.textContent="Ok"
    let span2 = document.createElement("button")
    span2.className="btn btn-danger"
	span2.textContent="Cancelar"
    botones.appendChild(span1)
    botones.appendChild(span2)
	td.appendChild(botones)
	$(span1).on("click",() => crear(lista, document.getElementById("in").value, td))
 	$(span2).on("click",() => td.innerHTML = "<button type='button' class='btn btn-dark' onclick='crearFormulario(event);'>+</button>")
}


function devolverMateria(td, nombre, requisitos) { //Esta funcion crea la nueva td y regresa el Checkbox para guardarlo en la propiedad select de cada materia
	let objeto = new materia(nombre, td); //Creamos y Agregamos la Nueva Materia al array.
	objeto.addReq(requisitos)
    let i = materia.objetos.length - 1; //Nos posicionamos sobre esta nueva materia.
    td.innerHTML = `
	<div class="contenedorx" onmouseover="ColorearRequisitos(materia.objetos[${i}]);" 
	onmouseleave="descolorearRequisitos(materia.objetos[${i}]);">
		<p>${nombre}</p>
		<input id="s${i}" type="checkbox" onclick="materia.objetos[${i}].desbloquear();">
	</div>
	`
	let input = $(`#s${i}`)[0]
    materia.objetos[i].select = input
	console.log("Materia Creada Satisfactoriamente"); //avisamos de su creacion.
    return input;
}

// for(let i=1; i < materia.objetos.length ;i++){
     // llenarTd(i)
// }
function llenarTd(i){
		let nombre = materia.objetos[i-1].nombre
		let template =
		`
			<div class="contenedorx" onmouseover="ColorearRequisitos(materia.objetos[${i-1}]);" onmouseleave="descolorearRequisitos(materia.objetos[${i-1}]);">
				<p>${nombre}</p>
				<input id="s${i}" type="checkbox" onclick="materia.objetos[${i-1}].desbloquear();">
			</div>
		`
		let td = $(`#td${i}`)[0] 
		td.innerHTML = template
		let input =$(`#s${i}`)[0]
		materia.objetos[i-1].select = input
        console.log(materia.objetos[i-1].select)
}
 

function ColorearRequisitos(materia) { // Funcion que permite colorear cada materia que sea requisito o prelacion
	materia.requisitos.forEach((req)=> req.td.className = "requisito")
	materia.prelaciones.forEach((pre)=>pre.td.className= "prelacion")
}

function descolorearRequisitos(materia) { // Funcion que permite descolorear cada materia que sea requisito o prelacion.
		materia.requisitos.forEach((req)=> {
			if (req.aprobada == true)  req.td.className = "aprobada"
			else  req.td.className = "normal"
		})
        materia.prelaciones.forEach((pre)=>{
			if (pre.aprobada == true) pre.td.className = "aprobada"
			else pre.td.className = "normal"
		})
}

//Funciones relacionadas a guardar el progreso

function crearArchivoJs() {
	const contenidoDeArchivo = content.innerText
	boton6.firstChild.download = "materias.js";
	boton6.firstChild.href = "data:application/octet-stream," + encodeURIComponent(contenidoDeArchivo);
}

function guardarPensum () {
	if(!(localStorage.getItem("guardado"))) {
		localStorage.setItem ("materias", content.textContent)
    	localStorage.setItem ("guardado", 1)
	} else {
		localStorage.setItem ("materias", content.textContent)
	}
    localStorage.setItem ("tabla", this.innerHTML)
    localStorage.setItem("materiaobjetos",materia.objetos)
    console.log('guardado')
}

init()
