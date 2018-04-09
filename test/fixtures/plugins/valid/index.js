#!/usr/bin/env node

const issue = {
  name: 'semi',
  description: 'Extra semicolon',
  severity: 'critical',
  context: {
    type: 'file',
    path: 'path/to/file.js',
    start: {
      line: 2,
      column: 10
    },
    end: {
      line: 2,
      column: 11
    }
  }
}

// console.log(JSON.stringify(report))

for (let i = 1; i <= 100; i++) {
  issue.id = String(i)

  process.stdout.write(JSON.stringify(issue))
  process.stdout.write('\0')
}
