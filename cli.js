#!/usr/bin/env node 
const mdlinks = require('./index');
const program = require('commander');

program
.option('-v, --validate', 'Validar')
.option('-s, --stats', 'Mostrar stats')
.action((file, commands) => {
	const options = {
		validate: false,
		stats: false
	};
	//si recibe comando --validate, cambia a true el options.validate
	if (program.validate) {
		options.validate = true;
	}

	//si recibe comando --stats, cambia a true el options.stats
	if (program.stats) {
		options.stats = true;
	}
 
	mdlinks(file, options)
	.then((result) => {
		result.map((data) => {
			if (options.validate === true && options.stats === false) {
				//{href: url, text: urlText, file: file, status: response.statusText}
				if (data.status === 'OK') {
					console.log(data.file + ' ' + data.href + ' - ' + data.status + ' ' + data.text);
				} else {
					console.log(data.file + ' ' + data.href + ' - fail ' + data.text);
				}
			} else if (options.validate === false && options.stats === false) {
				//{href: url, text: urlText, file: file}
				console.log(data.file + ' ' + data.href + ' ' + data.text);
			} else if (options.validate === false && options.stats === true) {
				//{total: total, unique: unique}
				console.log('Estadisticas para este archivo');
				console.log('total: ' + data.total);
				console.log('unicos: ' + data.unique);
			} else if (options.validate === true && options.stats === true) {
				//{total: total, unique: unique, broken: broken}
				console.log('Estadisticas para este archivo');
				console.log('total: ' + data.total);
				console.log('unicos: ' + data.unique);
				console.log('rotos: ' + data.broken);
			}
		});
	});
})
.parse(process.argv);