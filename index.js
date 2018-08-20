const fs = require('fs');
const fetch = require('node-fetch');
const program = require('commander');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//opciones por defecto
const options = {
	validate: false,
	stats: false
};

let total = 0;
let broken = 0;
let valid = 0;

const mdlinks = (file, options) => {
	//si file es relativo, convertirlo a absoluto

	const exist = existFile(file);
	if (exist) {
		const isMd = validateFile(file);
		if (isMd) {
			console.log(file + ' - es un archivo .md');
			
			//si recibe el comando --validate
			if (options.validate === true || options.stats === true) {
				const content = getContentFile(file);	
				//Separar el contenido en lineas
				const lines = content.split('\n');
				//Recorrer linea por linea
				iterateContentFile(lines);		
			}
		} else {
			return 'El archivo no tiene extensión .md';
		}
	} else {
		return 'El archivo no existe';
	}
};

//Funcion que recibe el nombre de un archivo y retorna true si es de extensión .md
const validateFile = (file) => {
	// -1 te situa antes del punto, para asegurarme que es una extensión
	//>>> retorna el mayor de 2 numeros
	//+2 te situa despues del punto
	const extension = file.slice((file.lastIndexOf('.') - 1 >>> 0) + 2);
	if(extension === 'md'){
		return true;
	} else {
		return false;
	}
}

const existFile = (file) => {
	if (fs.existsSync(file)) {
		return true;
	} else {
		return false;
	}
}

const getContentFile = (file) => {
	const contents = fs.readFileSync(file, 'utf8');
	return contents;
}

const iterateContentFile = (lines) => {
	let linesCount = 0;
	let linesTotal = lines.length;
	for (let line of lines) {
		//Verificar contenido de la linea
		findUrl(line);

		linesCount++;

		if (linesCount === linesTotal) {
			showStast();
		}
	}
}

const findUrl = (line) => {
	//Preguntar si contiene la expresion regular
	//http: url no seguro
	//https: url seguro
	//ftp: file transfer protocol (url para subir archivo a un hosting)
	//file: archivos
	const urlRegex = /(\b(http?|https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

	line.replace(urlRegex, (url) => {
		//capturar texto del url
		const urlText = getUrlText(line);
		//validar si la url funciona
		validateUrl(url, urlText);
	});
}

const getUrlText = (line) => {
	const urlLineText = line.substring(
		line.lastIndexOf('[') + 1, 
		line.lastIndexOf(']')
	);
	return urlLineText;
} 

const validateUrl = (url, urlText) => {
	let request = new XMLHttpRequest();
	request.open('GET', url, false);  // false hace la peticion sincrona
	request.send(null);

	if (request.status < 400) { //ok
		if (options.validate === true) {
			console.log(url + ' - ok ' + request.status + ' ' + urlText);
		}
		valid++;
	} else { //error
		if (options.validate === true) {
			console.log(url + ' - fail ' + request.status + ' ' + urlText);
		}
		broken++;
	}
	
}

const showStast = () => {
	if (options.stats === true) {
		total = valid + broken;
		console.log('Estadisticas de los urls');
		console.log('total = ' + total);
		console.log('validos = ' + valid);
		console.log('rotos = ' + broken);
	} 
}

//module.exports = mdlinks;

//ejecutar comandos
program
  .option('-v, --validate', 'Validar')
	.option('-s, --stats', 'Mostrar stats')
	//.action(mdlinks)
	.action((file, commands) => {
		//si recibe comando --validate, cambia a true el options.validate
		if (program.validate) {
			options.validate = true;
		}

		//si recibe comando --stats, cambia a true el options.stats
		if (program.stats) {
			options.stats = true;
		}

		mdlinks(file, options);
	})
	.parse(process.argv);

//si recibe comando --validate, cambia a true el options.validate
if (program.validate) {
	options.validate = true;
}

//si recibe comando --stats, cambia a true el options.stats
if (program.stats) {
	options.stats = true;
}