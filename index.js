const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

let options = {};
let total = 0;
let broken = 0;
let valid = 0;
const arrayLinks = [];
const arrayDuplicates = [];
let unique = 0;
const promises = [];
const results = [];

const readFile = (route) => {
	//si file es relativo, convertirlo a absoluto
	const pathAbsolute = path.resolve(route);
	//lees los stats del archivo para saber si es archivo o carpeta
	const statsFile = fs.statSync(pathAbsolute);

	//si es archivo
	if (statsFile.isFile()) {
		const exist = existFile(pathAbsolute); //verificar que el archivo existe
		if (exist) {
			processFile(pathAbsolute, route);
		}
	} else if (statsFile.isDirectory()) { //si es carpeta
		const files = fs.readdirSync(pathAbsolute);

		files.map((file) => {
			readFile(route + '/' + file);
		});
	}
};

const processFile = (completePath, fileName) => {
	const extension = validateFile(completePath);
	if (extension === '.md') {
		//si recibe el comando --validate
		const content = getContentFile(completePath);	
		//Separar el contenido en lineas
		const lines = content.split('\n');
		//Recorrer linea por linea
		iterateContentFile(lines, fileName);
	}
};

//Funcion que recibe el nombre de un archivo y retorna true si es de extensión .md
const validateFile = (file) => {
	return path.extname(file);
};

const existFile = (file) => {
	let exist = false;
	if (fs.existsSync(file)) {
		exist = true;
	}
	return exist;
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
	const promise = fetch(url)
	.then((response) => {
		switch(response.statusText) {
			case 'OK':
				valid++;
				break;
			default:
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
		return error;
	});

	promises.push(promise);
};

const mdlinks = (route, commandOptions) => {
	return new Promise(async (resolve, reject) => {
		options = commandOptions;
		readFile(route);

		//esperar que acaben todos los procesos asincronos
		await Promise.all(promises)
		.then(() => {
			total = valid + broken;

			if (options.validate === false && options.stats === true) {
				let result = {total: total, unique: unique};
				results.push(result);
			} else if (options.validate === true && options.stats === true) {
				let result = {total: total, unique: unique, broken: broken};
				results.push(result);
			}
		});

		return resolve(results);
	});
};

module.exports = mdlinks;