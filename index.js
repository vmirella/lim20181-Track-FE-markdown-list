const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path').resolve;

//opciones por defecto
let options = {};
let total = 0;
let broken = 0;
let valid = 0;
let arrayLinks = [];
let arrayDuplicates = [];
let unique = 0;
let promises = [];
let results = [];

const readFile = (route) => {
	//si file es relativo, convertirlo a absoluto
	let pathAbsolute = path(route);
	//lees los stats del archivo para saber si es archivo o carpeta
	const statsFile = fs.statSync(pathAbsolute);

	//si es archivo
	if (statsFile.isFile()) {
		const exist = existFile(pathAbsolute); //verificar que el archivo existe
		if (exist) {
			processFile(pathAbsolute, route);
		}
	} else if (statsFile.isDirectory()) { //si es carpeta
		let files = fs.readdirSync(pathAbsolute);

		files.map((file) => {
			readFile(route + '/' + file);
		});
	}
};

const processFile = (completePath, fileName) => {
	const isMd = validateFile(completePath);
	if (isMd) {
		console.log(fileName + ' - es un archivo .md');
		//si recibe el comando --validate
		const content = getContentFile(completePath);	
		//Separar el contenido en lineas
		const lines = content.split('\n');
		//Recorrer linea por linea
		iterateContentFile(lines, fileName);
		
		//ejecutar promises
		Promise.all(promises)
		.then((response) => {
			total = valid + broken;

			if (options.validate === false && options.stats === true) {
				let result = {total: total, unique: unique};
				results.push(result);
			} else if (options.validate === true && options.stats === true) {
				let result = {total: total, unique: unique, broken: broken};
				results.push(result);
			}

			showStast();
			resetVariables();
		});
	} else {
		return 'El archivo no tiene extensión .md';
	}
}

const resetVariables = () => {
	total = 0;
	broken = 0;
	valid = 0;
	arrayLinks = [];
	arrayDuplicates = [];
	unique = 0;
	promises = [];
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
};

const existFile = (file) => {
	if (fs.existsSync(file)) {
		return true;
	} else {
		return false;
	}
};

const getContentFile = (file) => {
	const contents = fs.readFileSync(file, 'utf8');
	return contents;
}

const iterateContentFile = (lines, file) => {
	for (let line of lines) {
		//Verificar contenido de la linea
		findUrl(line, file);
	}
};

const findUrl = (line, file) => {
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
		validateUrl(url, urlText, file);

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

};

const getUrlText = (line) => {
	const urlLineText = line.substring(
		line.lastIndexOf('[') + 1, 
		line.lastIndexOf(']')
	);
	return urlLineText;
};

const validateUrl = (url, urlText, file) => {
	let promise = fetch(url)
	.then((response) => {
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
		
		if (options.validate === true && options.stats === false) {
			let result = {href: url, text: urlText, file: file, status: response.statusText};
			results.push(result);
		} else if (options.validate === false && options.stats === false) {
			let result = {href: url, text: urlText, file: file};
			results.push(result);
		}
		
	})
	.catch((error) => {
		//console.log(url + ' - response.status =' + response.statusText);
	});

	promises.push(promise);
};

const showStast = () => {
	if (options.stats === true) {
		console.log('Estadisticas de los urls');
		console.log('total = ' + total);
		console.log('validos = ' + valid);
		console.log('únicos = ' + unique);
		if (options.validate === true) {
			console.log('rotos = ' + broken);
		}
	} 
};

const mdlinks = (route, commandOptions) => {
	options = commandOptions;
	readFile(route);

	return Promise.all(promises)
	.then((response) => {
		let result = new Promise(() => {
			return results;
		});

		return result;
	});
};

module.exports = mdlinks;