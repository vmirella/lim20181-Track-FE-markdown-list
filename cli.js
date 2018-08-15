#!/usr/bin/env node 
const lib = require('./index');

const args = process.argv;
const result = lib(args[2]);
console.log(result);

