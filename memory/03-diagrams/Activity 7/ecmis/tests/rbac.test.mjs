import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:8899'
const browser = await chromium.launch({ headless: true })

async function pageFor(username, path, password = '1234') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${BASE}/login.html`, { waitUntil: 'load' })
  const account = await page.evaluate(({ username, password }) => ECMISAuth.login(username, password), { username, password })
  assert.ok(account, `login failed: ${username}`)
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' })
  await page.waitForTimeout(400)
  return { context, page, errors }
}

{
  const { context, page } = await pageFor('intake.officer', '/intake-investigation/staff-workflow.html?role=division')
  const result = await page.evaluate(() => ({ role: ECMISIntakeAuth.currentRole('a4'), selector: document.querySelector('#wsRole')?.value, disabled: document.querySelector('#wsRole')?.disabled }))
  assert.deepEqual(result, { role: 'officer', selector: 'officer', disabled: true })
  await context.close()
}

{
  const { context, page } = await pageFor('a5.investigator.region1', '/intake-investigation/staff-workflow.html?view=a5&role=secretary')
  const result = await page.evaluate(() => ({ role: ECMISIntakeAuth.currentRole('a5'), unit: document.querySelector('#wsUnitA5')?.value, roleLocked: document.querySelector('#wsRoleA5')?.disabled, unitLocked: document.querySelector('#wsUnitA5')?.disabled }))
  assert.deepEqual(result, { role: 'investigator', unit: 'เขต 1', roleLocked: true, unitLocked: true })
  await context.close()
}

{
  const { context, page } = await pageFor('Somboon.T', '/intake-investigation/staff-workflow.html?view=a5&role=investigator')
  assert.equal(await page.locator('#ecmisDeny').count(), 1)
  assert.equal(await page.locator('[data-a5-action]').count(), 0)
  await context.close()
}

{
  const { context, page } = await pageFor('Somboon.T', '/board-resolution/inbox.html')
  const boardAccess = await page.evaluate(() => ({
    auth: JSON.parse(localStorage.getItem('ecmis-transform-auth-v1') || 'null'),
    role: ECMIS.currentRole()
  }))
  assert.equal(boardAccess.auth?.readOnly, true)
  assert.equal(boardAccess.role.id, 'board')
  assert.equal(boardAccess.role.perms.includes('EDIT.MASTER'), false)
  assert.equal(boardAccess.role.perms.includes('record.minutes'), false)
  assert.equal(await page.locator('#ecmisDeny').count(), 0)
  await context.close()
}

{
  const { context, page, errors } = await pageFor('a5.gbk', '/intake-investigation/staff-workflow.html?view=a5')
  const registry = await page.evaluate(() => ({
    count: ECMISAuth.USERS.length,
    unique: new Set(ECMISAuth.USERS.map(user => user.u.toLowerCase())).size,
    role: ECMISIntakeAuth.currentRole('a5')
  }))
  assert.equal(registry.unique, registry.count)
  assert.equal(registry.role, 'gbk-clerk')
  assert.equal(errors.length, 0)
  await context.close()
}

await browser.close()
console.log('PASS rbac: aggregate identity locks role and unit scope, direct URL is denied, read-only is enforced')
