const mdlinks = require('../index');

//console.log('hola');
describe('mdlinks', () => {
  test('mdlinks debería ser una funcion', () => {
    expect(typeof mdlinks).toBe('function');
  });

  const options = {
    validate: false,
    stats: false
  };

  //jest.setTimeout(10000);

  test('debería retornar un promise que resuelva un array', () => {
    return mdlinks('README.md', options).then(data => {
      expect(typeof data).toBe('array');
    });
  });

  test('debería retornar un promise que resuelva un array al recibir como parametro un directorio', () => {
    return mdlinks('prueba/', options).then(data => {
      expect(typeof data).toBe('array');
    });
  });

});