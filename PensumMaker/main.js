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
const PERIODO = "Semestre"

// Templates
const tablaTemplate = `
<div class="table-responsive" id="FullTabla">
	<table  class="table table-sm table-striped" id="tabla">
		<caption>Pensum Maker v3</caption>
		<thead class="thead-dark">
			<th class="periodo">${PERIODO} 1</th>
			<th>
				<button type="button" class="btn btn-light" id="aggPeriodo" onclick="Table.instance.agregarColumna()">+</button>
			</th>
		</thead>
		<tbody>
			<tr>
				<td id="td2">
					<button type="button" class="btn btn-dark" id="aggFila" onclick="Table.instance.agregarFila()">Agregar Fila</button>
				</td>
			</tr>
		</tbody>
	</table>
</div>
`
const buttonCrearFormularioTemplate = `<button type="button" class="btn btn-dark" onclick="crearFormulario();">+</button>`
const materiaTemplate = (i, nombre) => {
	return `
<p>${nombre}</p>
<input id="s${i}" type="checkbox";">
`
}
const formularioCrearMateriaTemplate = `
<form>
	<div class="form-group">
		<label for="materia_name">Nombre</label>
		<input type="text" class="form-control" id="materia_name" placeholder="Nombre de la Materia">
	</div>
		<label for="lis">Materias Requeridas</label>
</form>
`
class Materia {
	constructor (nombre, selector) {
		if (!Materia.objetos){
			Materia.objetos = new Set().add(this)
		} 
		else{
			Materia.objetos.add(this)	
		} 
		this.requisitos = new Set()
		this.prelaciones = new Set()
		this.nombre = nombre
		this.aprobada = 0
		this.td = null
		this.select = null
		this.positionX = 0
		this.positiony = 0
	}
	desbloquear  () {
		let materia = this
		console.log("Desbloqueando")
		if (materia.select.checked) {
		
			if (materia.requisitos.size == 0) {
				materia.aprobada = 1
				materia.td.className = "aprobada"
			} else {
				let porAprobar= "";
				materia.requisitos.forEach((req) => {
					let materia = this
					if (!req.aprobada) {
						porAprobar+= `\n ${req.nombre}` 
						materia.select.checked = false
					} 
				},this)
				if(porAprobar != "") {
					alert(`Te falta aprobar: ${porAprobar}`)
				} else {
					materia.aprobada = 1;
					materia.td.className = "aprobada";
				}
			}
		} else { //Este else se aplica cuando deseleccionamos el CheckBox y permite restaurar las propiedades de la materia y si es el caso tambien restaura todas las que la tengan como requisito.
			materia.aprobada = 0;
			materia.td.className = "normal";
			if (materia.prelaciones.size > 0) {
				materia.prelaciones.forEach( (pre) => {
					pre.td.className = "normal";
					pre.aprobada = 0;
					pre.select.checked = false;
				},this)
			}
		}
	}
	addReq(materiasRequisito){
		materiasRequisito.forEach((materiaRequisito)=>{
			this.requisitos.add(materiaRequisito)
			let ownRequisitos = this.requisitos
			let otherRequisitos = materiaRequisito.requisitos
			const union = new Set([...ownRequisitos, ...otherRequisitos ]);
			this.requisitos = union
			this.requisitos.forEach((requisito)=>{
				requisito.prelaciones.add(this);
			})
		})
	}
	colorear() { 
		// Funcion que permite colorear cada materia que sea requisito o prelacion
		this.requisitos.forEach((req)=> req.td.className = "requisito")
		this.prelaciones.forEach((pre)=>pre.td.className= "prelacion")
	}
	descolorear() { // Funcion que permite descolorear cada materia que sea requisito o prelacion.
		this.requisitos.forEach((req)=> {
			if (req.aprobada == true)  req.td.className = "aprobada"
			else  req.td.className = "normal"
		})
		this.prelaciones.forEach((pre)=>{
			if (pre.aprobada == true) pre.td.className = "aprobada"
			else pre.td.className = "normal"
		})
	}
}
class Table{
	constructor(table){
		Table.instance = this
		this.TableElement = table
		this.TableHead = table.rows[0]
		//this.tdCount = 0
	}
	#rows = 0
	get rows(){
		return this.TableElement.rows.length;
	}
	#columns = 0
	get columns(){
		return this.TableHead.childElementCount - 1
	}
	agregarFila() {
		if (this.rows <= MAX_MATERIAS) {
			let newRow = this.TableElement.insertRow(this.rows - 1);
			for (let x = 0; x < this.columns ; x++) {
				const nuevoTd = newRow.insertCell(x);
				/*this.tdCount++
				nuevoTd.id = "td" + this.tdCount;*/
				nuevoTd.pos = `${x},${this.rows-3}`
				nuevoTd.innerHTML= buttonCrearFormularioTemplate
			}	
		} else {
			alert(`No puedes agregar mas de ${MAX_MATERIAS} materias para un solo periodo.`);
		}
	}
	agregarColumna() { // Crea Nueva Columna
		if (this.TableHead.childElementCount <= MAX_PERIODO) {
			const nuevoTh = document.createElement("th")
			nuevoTh.className ="periodo"
			nuevoTh.innerHTML = `${PERIODO} ${this.TableHead.childElementCount}`;
			this.TableHead.insertBefore(nuevoTh, this.TableHead.lastElementChild);
			//Pulando a primeira fila th i = 1
			for (let y = 1; y <this.rows ; y++) {
				if (y != (this.rows - 1)) {
					const nuevoTd = this.TableElement.rows[y].insertCell()
					/*this.tdCount++
					nuevoTd.id = "td" + this.tdCount;*/
					nuevoTd.pos = `${this.columns-1},${y-1}`
					nuevoTd.innerHTML= buttonCrearFormularioTemplate
				} 
			}
		} else {
			alert(`No puedes agregar mas de ${MAX_PERIODO} periodos.`)
		}
	}
}

//Funciones para crear Nuevo Objeto materia dinamicamente.

function crearMateria(lista, td) {
	const nombre =  document.getElementById("materia_name").value
    const requisitos = new Set()
	Array.from(lista.selectedOptions).forEach(option=>requisitos.add(option.materia)); // manda la lista de materias para que verifique cuales fueron seleccionadas.
    if (!nombre) {
      alert("No has Ingresado el nombre de la nueva materia.");
	  return;
    } 
    else{
		if (requisitos.size == 0  ) {
			if (confirm("¿Estas seguro de crear la materia sin requisitos?") == false) {	
				return
			}
		}
		let materia = new Materia(nombre) //Creamos y Agregamos la Nueva Materia al array.
		let i = Materia.objetos.size - 1
		
		let divMateria = document.createElement('div');
		divMateria.className = "contenedorx"
		divMateria.innerHTML = materiaTemplate(i, nombre)
		divMateria.addEventListener("mouseenter",()=>{ materia.colorear()})
		divMateria.addEventListener("mouseleave", ()=>{ materia.descolorear()})

		td.innerHTML = ""
		td.appendChild(divMateria)
	
		let input = document.getElementById(`s${i}`)
		input.addEventListener("click",()=>{ materia.desbloquear()})
		
		materia.td = td;
		materia.select = input
		materia.addReq(requisitos)
	} 

}

function crearFormulario() { //Formulario para crear nueva materia.
    //Creamos elementos y asignamos valores a sus propiedades.
    var td = event.target.parentNode;
	td.innerHTML = formularioCrearMateriaTemplate
    
	var lista = document.createElement("select")
	lista.className = "chosen-select"
	lista.multiple = true
    //Agrupamos en orden los elementos del Formulario
	td.appendChild(lista)
    //Con creamos la lista de materias.
	if (Materia.objetos){
		Materia.objetos.forEach((materia)=>{
			const opcion = document.createElement('option')
			opcion.materia = materia
			opcion.textContent = materia.nombre
			lista.appendChild(opcion)
		})
	}
	$(".chosen-select").chosen({width: "100%"})

    let botones = document.createElement("div")
	botones.className ="pt-1 d-flex justify-content-around"
	
	let buttonConfirm = document.createElement("button")
    buttonConfirm.className="btn btn-success"
	buttonConfirm.textContent="Ok"
   
	let buttonCancel = document.createElement("button")
    buttonCancel.className="btn btn-danger"
	buttonCancel.textContent="Cancelar"
    
	botones.appendChild(buttonConfirm)
    botones.appendChild(buttonCancel)
	td.appendChild(botones)

	$(buttonConfirm).on("click",() => crearMateria(lista, td))
 	$(buttonCancel).on("click",() => td.innerHTML = "<button type='button' class='btn btn-dark' onclick='crearFormulario();'>+</button>")
}

function CrearTabla() {
	let contenedor = document.getElementById("contenedor")
	contenedor.innerHTML = tablaTemplate
	new Table(document.getElementById("tabla"))
}

CrearTabla()
Table.instance.agregarFila()
