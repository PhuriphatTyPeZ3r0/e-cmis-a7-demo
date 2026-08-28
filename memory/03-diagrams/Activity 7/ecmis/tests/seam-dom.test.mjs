import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:8899'
const browser = await chromium.launch({ headless: true })

async function login(page, username, password = '1234') {
  await page.goto(`${BASE}/login.html`, { waitUntil: 'load' })
  const account = await page.evaluate(({ username, password }) => window.ECMISAuth.login(username, password), { username, password })
  assert.ok(account, `login failed: ${username}`)
}

async function openAs(username, path, password = '1234') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const pageErrors = []
  const localFailures = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('response', response => {
    if (response.status() >= 400 && new URL(response.url()).origin === BASE) localFailures.push(`${response.status()} ${response.url()}`)
  })
  await login(page, username, password)
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  return { context, page, pageErrors, localFailures }
}

{
  const { context, page, pageErrors, localFailures } = await openAs('intake.officer', '/intake-investigation/staff-workflow.html?role=division')
  assert.equal(await page.evaluate(() => ECMISIntakeAuth.currentRole('a4')), 'officer')
  assert.equal(await page.locator('#wsRole').isDisabled(), true)
  assert.equal(pageErrors.length, 0)
  assert.equal(localFailures.length, 0)
  await context.close()
}

{
  const { context, page, pageErrors, localFailures } = await openAs('a5.clerk.region1', '/intake-investigation/staff-workflow.html?view=a5&role=secretary')
  assert.equal(await page.evaluate(() => ECMISIntakeAuth.currentRole('a5')), 'case-clerk')
  assert.equal(await page.locator('#wsRoleA5').isDisabled(), true)
  assert.equal(await page.locator('#wsUnitA5').inputValue(), 'เขต 1')
  assert.equal(await page.locator('#wsUnitA5').isDisabled(), true)
  assert.equal(pageErrors.length, 0)
  assert.equal(localFailures.length, 0)
  await context.close()
}

{
  const { context, page, pageErrors, localFailures } = await openAs('Thanakrit.B', '/board-resolution/board-resolution.html?case=0001%2F2569')
  assert.equal(await page.evaluate(() => Boolean(window.ECMISHub && window.ECMISHandoff && window.ECMISIntakeAggregate)), true)
  assert.equal(pageErrors.length, 0)
  assert.equal(localFailures.length, 0)
  await context.close()
}

await browser.close()
console.log('PASS seam-dom: current intake A4/A5 and Activity 7 load with aggregate contracts and zero pageerror')
