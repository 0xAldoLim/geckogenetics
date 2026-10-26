import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('calculator, advanced controls and library meet automated WCAG A/AA checks', async ({
  page,
}) => {
  test.setTimeout(90000)
  await page.goto('/')
  await expect(page.locator('.parent-card')).toHaveCount(2)
  const audit = async () => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          reason: n.failureSummary,
        })),
      })),
    ).toEqual([])
  }
  await audit()
  await page
    .getByRole('region', { name: 'Sire parent' })
    .getByRole('button', { name: 'Advanced genetics & evidence' })
    .click()
  await page.locator('#Sire-tremper').selectOption('possible')
  await audit()
  const toggle = page.getByRole('button', { name: 'Toggle navigation' })
  if (await toggle.isVisible()) await toggle.click()
  await page.getByRole('button', { name: 'Morph library', exact: true }).click()
  await audit()
})
test('opening Snow cross, result views, and Punnett square work', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Small geckos. Big possibilities.' }),
  ).toBeVisible()
  await expect(page.locator('.offspring-card')).toHaveCount(3)
  await expect(page.locator('.probability-badge')).toHaveText([
    '25%',
    '50%',
    '25%',
  ])
  await page.getByRole('button', { name: 'By genotype', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'By genotype', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.punnett-panel > summary').click()
  await expect(page.locator('.punnett-table')).toBeVisible()
  await expect(page.locator('.punnett-table tbody td')).toHaveCount(4)
  await page.locator('.offspring-card').first().locator('summary').click()
  await expect(
    page.locator('.offspring-card').first().getByText('25% of all offspring'),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
test('Sunglow scenarios update independently of line-bred ancestry', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Educational pairing preset').selectOption('sunglow-a')
  await expect(page.locator('.offspring-card')).toHaveCount(1)
  await expect(page.locator('.probability-badge')).toHaveText(['100%'])
  await expect(page.locator('.carrier-list')).toContainText(
    '100% confirmed het Tremper Albino',
  )
  await expect(page.locator('.lineage-results')).toContainText('Carrot Tail')
  await page.getByLabel('Educational pairing preset').selectOption('sunglow-b')
  await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
  await page.getByRole('button', { name: 'Swap', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Sire parent' })).toContainText(
    'SHTCT',
  )
  await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
})
test('advanced genotypes, possible het, reset and observations', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' }),
    dam = page.getByRole('region', { name: 'Dam parent' })
  await sire
    .getByRole('button', { name: 'Advanced genetics & evidence' })
    .click()
  await dam
    .getByRole('button', { name: 'Advanced genetics & evidence' })
    .click()
  await sire.locator('#Sire-tremper').selectOption('possible')
  await sire
    .getByLabel('Sire Tremper Albino possible het probability')
    .selectOption('2/3')
  await sire
    .getByLabel('Sire Tremper Albino custom carrier probability')
    .fill('75')
  await expect(sire.locator('.trait-chips')).toContainText('75% possible het')
  await dam.locator('#Dam-tremper').selectOption('2')
  await page.getByRole('button', { name: 'Calculate offspring' }).click()
  await expect(page.locator('.results-section')).toContainText(
    'Possible-het estimates are included for Tremper Albino',
  )
  await page.locator('.observation-panel summary').click()
  await page.getByLabel('OBSERVED HATCHLING LABEL').fill('Super Snow')
  await page.getByRole('button', { name: 'Compare with predictions' }).click()
  await expect(page.locator('.observation-panel')).toContainText(
    'compatible with at least one predicted genotype',
  )
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.locator('.results-section')).toContainText(
    'Start with what you know',
  )
  await expect(sire.locator('#Sire-tremper')).toHaveValue('unknown')
})
test('ambiguous shorthand is preserved without contaminating predictions', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' })
  await sire.getByLabel('Sire morph search').fill('MSEBN H T')
  await sire
    .getByRole('button', { name: 'Review shorthand / custom label' })
    .click()
  await expect(sire.locator('.parse-review')).toContainText('Unresolved:')
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire).toContainText('Preserved labels: MSEBN, H, T')
  await page.getByRole('button', { name: 'Calculate offspring' }).click()
  await expect(page.locator('.probability-badge')).toHaveText([
    '25%',
    '50%',
    '25%',
  ])
  await sire.getByLabel('Sire morph search').fill('50% PH TA')
  await sire
    .getByRole('button', { name: 'Review shorthand / custom label' })
    .click()
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.locator('.trait-chips')).toContainText('50% possible het')
})
test('save, restore, delete, and share round-trip the pairing', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Educational pairing preset').selectOption('sunglow-b')
  await page.getByRole('button', { name: 'Save pairing', exact: true }).click()
  const openNav = async () => {
    const toggle = page.getByRole('button', { name: 'Toggle navigation' })
    if (await toggle.isVisible()) await toggle.click()
  }
  await openNav()
  await page.getByRole('button', { name: /Saved pairings/ }).click()
  await expect(page.locator('.saved-list article')).toHaveCount(1)
  await page.getByRole('button', { name: 'Load pairing' }).click()
  await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
  await page.getByRole('button', { name: 'Share pairing', exact: true }).click()
  const link = await page.getByLabel('Shareable pairing link').inputValue()
  await page.goto(link)
  await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
  await openNav()
  await page.getByRole('button', { name: /Saved pairings/ }).click()
  await page.getByRole('button', { name: /Delete Sunglow/ }).click()
  await expect(page.locator('.saved-list article')).toHaveCount(0)
})
test('library search, uncertain morphs, and welfare warnings are accessible', async ({
  page,
}) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Toggle navigation' })
  if (await toggle.isVisible()) await toggle.click()
  await page.getByRole('button', { name: 'Morph library', exact: true }).click()
  await page.getByLabel('Search morph library').fill('Giant')
  await expect(page.locator('.library-card')).toHaveCount(3)
  await expect(page.locator('.library-grid')).toContainText(
    'Disputed inheritance',
  )
  await page.getByLabel('Search morph library').fill('Lemon Frost')
  await page.getByRole('button', { name: 'Use in calculator' }).click()
  await page.getByRole('button', { name: 'Calculate offspring' }).click()
  await expect(page.locator('.welfare-warning')).toContainText(
    'Animal welfare comes first',
  )
  await expect(page.locator('.offspring-card')).toHaveCount(0)
})
test('invalid links and corrupted browser storage fail visibly and safely', async ({
  page,
}) => {
  await page.goto('/#pair=bad!!')
  await expect(page.getByRole('status')).toContainText('invalid or unsupported')
  await page.evaluate(() =>
    localStorage.setItem('geckogenetics.pairings.v1', 'not json'),
  )
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('could not be read')
  await page.getByRole('button', { name: 'Save pairing', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Could not save')
  expect(
    await page.evaluate(() =>
      localStorage.getItem('geckogenetics.pairings.v1'),
    ),
  ).toBe('not json')
})
test('desktop and mobile render without overflow or runtime errors', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.locator('.offspring-card')).toHaveCount(3)
  expect(errors).toEqual([])
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-calculator.png`,
    fullPage: true,
  })
})

test('learning flow, result copy and keyboard access work', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Copy results', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    /copied|Clipboard unavailable/,
  )
  await page
    .getByText('Plain-text results & assumptions', { exact: true })
    .click()
  const summary = await page.getByLabel('Plain-text results').inputValue()
  expect(summary).toContain('25% Normal at modeled loci')
  expect(summary).toContain('Unspecified loci remain unknown')
  await page.getByRole('button', { name: 'Let’s learn genetics' }).click()
  await expect(
    page.getByRole('heading', { name: 'Understand the possibilities.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Explore the example' }).click()
  await expect(page.locator('.probability-badge')).toHaveText(['100%'])
  await page.keyboard.press('Control+Home')
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
})

test('new index names are searchable and eye/pattern artwork changes the right features', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Toggle navigation' })
  if (await toggle.isVisible()) await toggle.click()
  await page.getByRole('button', { name: 'Morph library', exact: true }).click()
  const search = page.getByLabel('Search morph library')
  const card = (name: string) =>
    page
      .locator('.library-card')
      .filter({ has: page.getByRole('heading', { name, exact: true }) })
  for (const name of ['Pied', 'Super Pied', 'Bojoneroko', 'Dark Tangerine']) {
    await search.fill(name)
    await expect(card(name)).toBeVisible()
  }
  await expect(card('Dark Tangerine')).toContainText(
    /not automatically Black Night/i,
  )
  await search.fill('Bojoneroko')
  await expect(card('Bojoneroko')).toContainText('unverified')
  await search.fill('Pied')
  await expect(card('Pied').locator('.cartoon-art')).toHaveAttribute(
    'data-pattern',
    'pied',
  )
  await expect(card('Super Pied').locator('img.cartoon-gecko')).toHaveAttribute(
    'src',
    /super-pied\.webp$/,
  )
  await search.fill('Eclipse')
  await expect(card('Eclipse').locator('.cartoon-art')).toHaveAttribute(
    'data-eyes',
    'solid-black',
  )
  await search.fill('Marble Eye')
  await expect(card('Marble Eye').locator('.cartoon-art')).toHaveAttribute(
    'data-eyes',
    'marbled',
  )
  await expect(card('Marble Eye').locator('.cartoon-art')).toHaveAttribute(
    'data-body',
    'normal',
  )
  await search.fill('')
  await page.getByLabel('Filter morph category').selectOption('eyes')
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-eye-traits.png`,
    fullPage: true,
  })
  await page.getByLabel('Filter morph category').selectOption('patterns')
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-pattern-traits.png`,
    fullPage: true,
  })
  await page.getByLabel('Filter morph category').selectOption('all')
  await page.getByLabel('Filter catalog source').selectOption('marketplace')
  await search.fill('Dark Tangerine')
  await expect(card('Dark Tangerine')).toBeVisible()
})

test('hidden albino carriers retain a normal illustration', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Educational pairing preset').selectOption('sunglow-a')
  const offspring = page.locator('.offspring-card .cartoon-art')
  await expect(offspring).toHaveAttribute('data-body', 'normal')
  await expect(offspring).toHaveAttribute('data-eyes', 'slit')
  await expect(offspring.locator('img')).toHaveJSProperty('complete', true)
  await expect(offspring.locator('img')).not.toHaveJSProperty('naturalWidth', 0)
})

test('parent controls preserve eye patterns and apply selected body markings', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' })
  const art = sire.locator('.cartoon-art')
  const search = sire.getByLabel('Sire morph search')
  await search.fill('Marble Eye')
  await sire
    .locator('.morph-options button')
    .filter({ hasText: 'Marble Eye' })
    .click()
  await expect(art).toHaveAttribute('data-eyes', 'marbled')
  await sire
    .getByRole('button', { name: 'Advanced genetics & evidence' })
    .click()
  await sire.locator('#Sire-snow').selectOption('1')
  await sire.locator('#Sire-tremper').selectOption('1')
  await expect(art).toHaveAttribute('data-eyes', 'marbled')
  await search.fill('Normal / Wild Type')
  await sire
    .locator('.morph-options button')
    .filter({ hasText: 'Normal / Wild Type' })
    .click()
  await sire
    .getByRole('button', { name: 'Reverse Stripe', exact: true })
    .click()
  await expect(art).toHaveAttribute('data-pattern', 'reverse-stripe')
  await expect(art).toHaveAttribute('data-body', 'normal')
})
