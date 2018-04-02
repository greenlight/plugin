#!/usr/bin/env node

const { join } = require('path')
const { readFileSync } = require('fs')

const info = readFileSync(join(__dirname, 'plugin.json'), 'utf-8')
const report = readFileSync(join(__dirname, 'report.json'), 'utf-8')

const command = process.argv[2]

console.log(command === 'info' ? info : report)
