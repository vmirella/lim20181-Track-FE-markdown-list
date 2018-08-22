const fs = require('fs');
const fetch = require('node-fetch');
const program = require('commander');
const path = require('path').resolve;

//opciones por defecto
const options = {
	validate: false,
	stats: false
};

let total = 0;
let broken = 0;
let valid = 0;
let arrayLinks = [];
let arrayDuplicates = [];
let unique = 0;
let promises = [];

const mdlinks = (file, options) => {
	//si file es relativo, convertirlo a absoluto
	file = path(file);
	
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
				
				//ejecutar promises
				Promise.all(promises)
				.then((response) => {
					showStast();
				});
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
	//let linesCount = 0;
	//let linesTotal = lines.length;
	for (let line of lines) {
		//Verificar contenido de la linea
		findUrl(line);

		//linesCount++;

		/*if (linesCount === linesTotal) {
			showStast();
		}*/
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

		//Verificar cuantos urls repetidos hay en el array
		if (arrayLinks.indexOf(url) === -1) { //Sino lo encuentra
			arrayLinks.push(url);
		} else {
			if (arrayDuplicates.indexOf(url) === -1) {
				arrayDuplicates.push(url);
			}
		}
	});
	unique = arrayLinks.length - arrayDuplicates.length;

}

const getUrlText = (line) => {
	const urlLineText = line.substring(
		line.lastIndexOf('[') + 1, 
		line.lastIndexOf(']')
	);
	return urlLineText;
} 

const validateUrl = (url, urlText) => {
	let promise = fetch(url)
	.then((response) => {
		let status;
		switch(response.statusText) {
			case 'OK':
				if (options.validate === true) {
					console.log(url + ' - ok ' + response.status + ' ' + urlText);
				}
				else {
					console.log(url);
				}
				valid++;
				break;
			case 'Not Found':
				if (options.validate === true) {
					console.log(url + ' - fail ' + response.status + ' ' + urlText);
				}
				broken++;
				break;
		}

		//return {url: url, text: urlText};
	})
	.catch((error) => {
		//console.log(url + ' - response.status =' + response.statusText);
	});

	promises.push(promise);
}

const showStast = () => {
	if (options.stats === true) {
		total = valid + broken;
		console.log('Estadisticas de los urls');
		console.log('total = ' + total);
		console.log('validos = ' + valid);
		console.log('rotos = ' + broken);
		console.log('únicos = ' + unique);
	} 
}

module.exports = mdlinks;

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