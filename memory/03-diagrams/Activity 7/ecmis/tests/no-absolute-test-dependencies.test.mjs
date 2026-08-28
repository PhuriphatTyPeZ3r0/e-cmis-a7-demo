import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function javascriptTests(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return javascriptTests(path)
    return entry.name.endsWith('.mjs') ? [path] : []
  })
}

const files = [...javascriptTests(join(root, 'tests')), ...javascriptTests(join(root, 'intake-investigation', 'tests'))]
const violations = []
for (const file of files) {
  const source = readFileSync(file, 'utf8')
  if (/\/Users\/jetsadasomporn\//.test(source)) violations.push(`${relative(root, file)}: absolute user path`)
  if (/node_modules\/playwright\/index\.mjs/.test(source)) violations.push(`${relative(root, file)}: direct Playwright module file`)
}

assert.deepEqual(violations, [])
console.log(`PASS no absolute test dependencies: ${files.length} test files`)
