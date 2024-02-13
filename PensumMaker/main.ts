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

class Materia {
	static objetos: Set<Materia>
	static matriz: Array<Array<Materia>>
	requisitos: Set<Materia>
	prelaciones: Set<Materia>
	nombre: string
	aprobada: boolean
	td: HTMLTableCellElement
	select: HTMLInputElement
	constructor (nombre: string, td: HTMLTableCellElement) {
		if (!Materia.objetos){
			Materia.objetos = new Set<Materia>().add(this)
			Materia.matriz= [[],[],[],[],[],[],[],[],[],[]]
		} 
		else{
			Materia.objetos.add(this)
		} 
		
		this.requisitos = new Set()
		this.prelaciones = new Set()
		this.nombre = nombre
		this.aprobada = false
		this.td = td
	}
	desbloquear  () {
		console.log("Desbloqueando")
		if (this.select.checked) {
		
			if (this.requisitos.size == 0) {
				this.aprobada = true
				this.td.className = "aprobada"
			} else {
				let porAprobar= "";
				this.requisitos.forEach((req) => {
					let materia = this
					if (!req.aprobada) {
						porAprobar+= `\n ${req.nombre}` 
						materia.select.checked = false
					} 
				},this)
				if(porAprobar != "") {
					alert(`Te falta aprobar: ${porAprobar}`)
				} else {
					this.aprobada = true;
					this.td.className = "aprobada";
				}
			}
		} else { //Este else se aplica cuando deseleccionamos el CheckBox y permite restaurar las propiedades de la materia y si es el caso tambien restaura todas las que la tengan como requisito.
			this.aprobada = false;
			this.td.className = "normal";
			if (this.prelaciones.size > 0) {
				this.prelaciones.forEach( (pre) => {
					pre.td.className = "normal";
					pre.aprobada = false;
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
			this.requisitos = new Set([...ownRequisitos, ...otherRequisitos ]);
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
			else  req.td.className = ""
		})
		this.prelaciones.forEach((pre)=>{
			if (pre.aprobada == true) pre.td.className = "aprobada"
			else pre.td.className = ""
		})
	}
	excluir(){
		this.descolorear()
		this.td.innerHTML = ""
		Materia.matriz[this.td.posX][this.td.posY] = null;
		this.requisitos.forEach((materiaRequisito)=>{
			materiaRequisito.prelaciones.delete(this)
		})
		this.prelaciones.forEach((materiaPrelacion)=>{
			materiaPrelacion.requisitos.delete(this)
		})
		this.td.appendChild(crearBotonParaCrearMateria())
		Materia.objetos.delete(this)
	}
	editar(){
		this.descolorear()
		this.td.innerHTML = ""

		let lista = crearListaYFormulario(this.td, this.nombre)
		document.getElementById("materia_name").value = this.nombre

		let options = $("#selecion").find("option")
		this.requisitos.forEach((materiaRequisito)=>{
			options
			.filter(function( index ) {
				let option = $( this )[0]
				return option.materia.nombre == materiaRequisito.nombre;
				})
			.prop("selected", true)
			.end()
		})
		$('#selecion').trigger("chosen:updated");

		let {botonCancelar, botonConfirmar} = crearBotonesFormulario(this.td)
		$(botonConfirmar).on("click",() => this.actualizar(lista))
		$(botonCancelar).on("click",() => this.mostrar())
	}
	actualizar(listaNovosRequisitos){
		const novosRequisitos = new Set()
		Array.from(listaNovosRequisitos.selectedOptions).forEach(option=>novosRequisitos.add(option.materia));
		this.requisitos.forEach((materiaRequisito)=>{
			materiaRequisito.prelaciones.delete(this)
		})
		this.requisitos = new Set()
		this.addReq(novosRequisitos)
		/*const diff = Array.from(novosRequisitos).filter(x => !Array.from(this.requisitos).includes(x));
		if(diff.length > 0){
			this.addReq(diff)
		}
		else{

		}*/
		this.mostrar()
	}
	mostrar(){
		
		let pEdit = document.createElement("span")
		pEdit.className = "optEdit"
		pEdit.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>'

		let pEliminar = document.createElement("span")
		pEliminar.className = "optEliminar"
		pEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>'

		let pNombre = document.createElement('p')
		pNombre.textContent = this.nombre
		
		let input = document.createElement("input")
		input.type = "checkbox"
		
		let divOpciones = document.createElement("div")
		divOpciones.className = "materiaOptions"
		divOpciones.appendChild(pEdit)
		divOpciones.appendChild(pEliminar)

		let divMateria = document.createElement('div');
		divMateria.className = "contenedorx"
		divMateria.appendChild(divOpciones)
		divMateria.appendChild(pNombre)
		divMateria.appendChild(input)
		divMateria.addEventListener("mouseenter",()=>{ this.colorear()})
		divMateria.addEventListener("mouseleave", ()=>{ this.descolorear()})
	
		this.td.innerHTML = ""
		this.td.appendChild(divMateria)
		this.select = input
		pEdit.addEventListener("click", ()=> this.editar())
		pEliminar.addEventListener("click",() => this.excluir())
		input.addEventListener("click",()=>{ this.desbloquear()})
		
	}
}
class Table{
	static instance: Table
	TableElement: HTMLTableElement
	TableHead: HTMLTableRowElement
	constructor(table){
		Table.instance = this
		this.TableElement = table
		this.TableHead = table.rows[0]
		
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
				nuevoTd.posX = `${x}`
				nuevoTd.posY = `${this.rows-3}`
				let botonCrearMateria = crearBotonParaCrearMateria()
				nuevoTd.appendChild(botonCrearMateria)
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
					nuevoTd.posX = `${this.columns-1}`
					nuevoTd.posY = `${y-1}`
					let botonCrearMateria = crearBotonParaCrearMateria()
					nuevoTd.appendChild(botonCrearMateria)
				} 
			}
		} else {
			alert(`No puedes agregar mas de ${MAX_PERIODO} periodos.`)
		}
	}
}
function crearBotonParaCrearMateria(){
	let button = document.createElement("button")
	button.type = "button"
	button.className = "btn btn-dark"
	button.addEventListener("click",crearFormulario)
	button.textContent = "+"
	return button
}



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

		let materia = new Materia(nombre, td) //Creamos y Agregamos la Nueva Materia al array.
		Materia.matriz[td.posX][td.posY] = materia
		materia.addReq(requisitos)
		materia.mostrar()	
	} 

}


function crearFormulario(event) { //Formulario para crear nueva materia.
    //Creamos elementos y asignamos valores a sus propiedades.
	
	let td = event.target.parentNode;
	td.innerHTML = ""
	let lista = crearListaYFormulario(td)
	
	$(".chosen-select").chosen({width: "100%"})

    let {botonCancelar, botonConfirmar} = crearBotonesFormulario(td)
	
	botonConfirmar.addEventListener("click",() => crearMateria(lista, td))
	botonCancelar.addEventListener("click",() => { 
		td.innerHTML = ""
		td.appendChild(crearBotonParaCrearMateria());
	} )
}

function crearListaYFormulario(td, nombreMateria=""){
	
	let labelForMateria = document.createElement("label")
	labelForMateria.setAttribute("for", "materia_name")
	labelForMateria.textContent = "Nombre"
	
	let inputNombre = document.createElement("input")
	inputNombre.type = "text"
	inputNombre.className = "form-control"
	inputNombre.id = "materia_name"
	inputNombre.placeholder = "Nombre de la materia"

	let divFormGroup = document.createElement("div")
	divFormGroup.className = "form-group"
	divFormGroup.appendChild(labelForMateria)
	divFormGroup.appendChild(inputNombre)

	let labelForLista = document.createElement("label")
	labelForLista.setAttribute("for", "lis")
	labelForLista.textContent = "Materias Requeridas"
	
	let lista = document.createElement("select")
	lista.className = "chosen-select"
	lista.id = "selecion"
	lista.multiple = true
   
	let form = document.createElement("form")
	form.appendChild(divFormGroup)
	form.appendChild(labelForLista)
	form.appendChild(lista)
    //Con creamos la lista de materias.
	
	if (Materia.objetos){
		Materia.objetos.forEach((materia)=>{
			if(nombreMateria != ""){
				if (materia.nombre == nombreMateria){
					return
				}
			}
			const opcion = document.createElement('option')
			opcion.materia = materia
			opcion.textContent = materia.nombre
			lista.appendChild(opcion)
		})
	}
	
	td.appendChild(form)
	td.formularioMateria = form

	$(".chosen-select").chosen({width: "100%"})
	return lista
}
function crearBotonesFormulario(td){
	let buttonConfirm = document.createElement("button")
    buttonConfirm.className="btn btn-success"
	buttonConfirm.textContent="Ok"
   
	let buttonCancel = document.createElement("button")
    buttonCancel.className="btn btn-danger"
	buttonCancel.textContent="Cancelar"

    let botones = document.createElement("div")
	botones.className ="pt-1 d-flex justify-content-around"
	botones.appendChild(buttonConfirm)
    botones.appendChild(buttonCancel)

	td.appendChild(botones)

	return {"botonCancelar":buttonCancel, "botonConfirmar": buttonConfirm}
}

const tablaTemplate = `
<div class="table-responsive" id="FullTabla">
	<table  class="table table-sm table-striped table-bordered " id="tabla">
		<caption>Pensum Maker v3</caption>
		<thead class="thead-dark">
			<th class="periodo">${PERIODO} 1</th>
			<th>
				<button type="button" class="btn btn-light" id="aggPeriodo" onclick="Table.instance.agregarColumna()">+</button>
			</th>
		</thead>
		<tbody>
			<tr>
				<td >
					<button type="button" class="btn btn-dark" id="aggFila" onclick="Table.instance.agregarFila()">Agregar Fila</button>
				</td>
			</tr>
		</tbody>
	</table>
</div>
`
function CrearTabla() {
	let contenedor = document.getElementById("contenedor")
	contenedor.innerHTML = tablaTemplate
	new Table(document.getElementById("tabla"))
}

CrearTabla()
Table.instance.agregarFila()
