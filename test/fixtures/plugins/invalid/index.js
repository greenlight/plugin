#!/usr/bin/env node

const { join } = require('path')
const { readFileSync } = require('fs')

const info = readFileSync(join(__dirname, 'plugin.json'), 'utf-8')

const command = process.argv[2]

console.log(command === 'info' ? info : 'foobar')
