#!/usr/bin/env node 
const lib = require('./index');

const args = process.argv;
console.log(args);
const result = lib(args[2]);
console.log(result);
// lib(args);
