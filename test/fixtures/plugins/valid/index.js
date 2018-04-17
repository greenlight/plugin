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

for (let i = 1; i <= 5; i++) {
  issue.id = String(i)

  process.stdout.write(JSON.stringify(issue))
  process.stdout.write('\0')

  process.stderr.write(`${issue.id} debug message`)
  process.stderr.write('\0')
}
