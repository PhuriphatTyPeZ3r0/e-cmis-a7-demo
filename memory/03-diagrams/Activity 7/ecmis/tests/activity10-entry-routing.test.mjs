import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:8899'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()

await page.goto(`${BASE}/login.html`)
const entry = await page.evaluate(() => {
  const user = ECMISAuth.USERS.find(item => item.act === 'legal-case')
  const account = ECMISAuth.login(user.u, user.p)
  return ECMISAuth.actEntry(account.act)
})

const response = await page.goto(`${BASE}/${entry}`, { waitUntil: 'load' })
assert.equal(response?.status(), 200)
assert.equal(new URL(page.url()).pathname, '/legal-case/01-work-inbox.html')
assert.notEqual(await page.title(), 'Error response')

await context.close()
await browser.close()
console.log('PASS central login routes Activity 10 to its work inbox')
