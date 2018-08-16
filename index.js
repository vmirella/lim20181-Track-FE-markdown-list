const fs = require('fs');
const fetch = require('node-fetch');
const program = require('commander');

//opciones por defecto
const options = {
	validate: false,
	stats: false
};

const mdlinks = (file, options) => {
	const exist = existFile(file);
	if (exist) {
		const isMd = validateFile(file);
		if (isMd) {
			console.log(file + ' - es un archivo .md');
			
			//si recibe el comando --validate
			if (options.validate === true) {
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
	for (let line of lines) {
		//Verificar contenido de la linea
		findUrl(line);
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
		const urlText = line.substring(
			line.lastIndexOf('[') + 1, 
			line.lastIndexOf(']')
		);
		//validar si la url funciona
		fetch(url)
		.then((response) => {
			if (response.statusText === 'OK') {
				console.log(url + ' - ok ' + response.status + ' ' + urlText);
			}
			else if (response.statusText === 'Not Found') {
				console.log(url + ' - fail ' + response.status + ' ' + urlText);
			}			
		})
		.catch((error) => {
			//console.log(url + ' - response.status =' + response.statusText);
		});
	});
}

module.exports = mdlinks;

//ejecutar comandos
program
  .option('-v, --validate', 'Validar')
	.option('-s, --stats', 'Mostrar stats')
	.action(mdlinks)
	.parse(process.argv);

//si recibe comando --validate, cambia a true el options.validate
if (program.validate) {
	options.validate = true;
}

//si recibe comando --stats, cambia a true el options.stats
if (program.stats) {
	options.stats = true;
}