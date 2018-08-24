global.window = global;
global.assert = require('chai').assert;

require('../index.js');
require('./index.spec.js');
