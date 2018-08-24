const mdlinks = require('../index');

//console.log('hola');
describe('mdlinks', () => {
  it('debería exponer función validateFile()', () => {
    expect(typeof validateFile).toBe('function');
  });
});