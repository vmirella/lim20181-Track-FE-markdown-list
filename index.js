const fs = require('fs');

const mdlinks = (file) => {
	const exist = existFile(file);
	if (exist) {
		const isMd = validateFile(file);
		if (isMd) {
			const content = getContentFile(file);	
			//Separar el contenido en lineas
			const lines = content.split('\n');
			//Recorrer linea por linea
			iterateContentFile(lines);
			return true;
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
		console.log(line);
	}
}
module.exports = mdlinks;
