exports.mdLinks = () => {
	return 'Hola mundo';
};

//Funcion que recibe el nombre de un archivo y retorna true si es de extensión .md
const validateFile = (file) => {
	// -1 te situa antes del punto, para asegurarme que es una extensión
	//>>> retorna el mayor de 2 numeros
	//+2 te situa despues del punto
	const extension = file.slice((file.lastIndexOf('.') - 1 >>> 0) + 2);
	if(entension === 'md'){
		return true;
	} else {
		return false;
	}
}
