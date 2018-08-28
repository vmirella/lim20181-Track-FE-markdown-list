const mdlinks = require('../index');

describe('mdlinks', () => {
  test('mdlinks debería ser una funcion', () => {
    expect(typeof mdlinks).toBe('function');
  });

  const options = {
    validate: false,
    stats: false
  };

  test('debería retornar array vacio al recibir un archivo sin extension .md', (done) => {
    options.validate = false;
    options.stats = false;

    mdlinks('test_files/test.txt', options)
    .then((data) => {
      expect(JSON.stringify(data)).toEqual('[]');
      done();
    })
  });

  test('debería ser una instancia de Promise', () => {
    return expect(mdlinks('test_files/test.md', options)).toBeInstanceOf(Promise);
  });

  test('debería retornar un promise que resuelva un array', (done) => {
    options.validate = false;
    options.stats = false;

    mdlinks('test_files/test.md', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

  test('debería retornar un promise que resuelva un array --validate', (done) => {
    options.validate = true;
    options.stats = false;

    mdlinks('test_files/test.md', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

  test('debería retornar un promise que resuelva un array --stats', (done) => {
    options.validate = false;
    options.stats = true;

    mdlinks('test_files/test.md', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

  test('debería retornar un promise que resuelva un array --validate --stats', (done) => {
    options.validate = true;
    options.stats = true;
    
    mdlinks('test_files/test.md', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

  test('debería retornar un promise que resuelva un array para un directorio', (done) => {
    options.validate = false;
    options.stats = false;

    mdlinks('test_files', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

  test('debería retornar un promise que resuelva un array para un directorio --validate', (done) => {
    options.validate = true;
    options.stats = false;

    mdlinks('test_files', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

  test('debería retornar un promise que resuelva un array para un directorio --stats', (done) => {
    options.validate = false;
    options.stats = true;

    mdlinks('test_files', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

  test('debería retornar un promise que resuelva un array para un directorio --validate --stats', (done) => {
    options.validate = true;
    options.stats = true;

    mdlinks('test_files', options)
    .then((data) => {
      expect(data[0].href).toEqual('https://es.wikipedia.org/wiki/Markdown');
      expect(data[0].text).toEqual('Markdown');
      expect(data[0].file).toEqual('test_files/test.md');
      done();
    });
  });

});