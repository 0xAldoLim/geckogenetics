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
    .getByRole('button', { name: 'More options & notes (optional)' })
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
  await page
    .getByRole('button', { name: 'Genetics details', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Genetics details', exact: true }),
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
    'All carry Tremper Albino (het)',
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
    .getByRole('button', { name: 'More options & notes (optional)' })
    .click()
  await dam
    .getByRole('button', { name: 'More options & notes (optional)' })
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
    .getByRole('button', { name: 'Review combination / custom label' })
    .click()
  await expect(sire.locator('.parse-review')).toContainText('Unresolved:')
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.getByRole('alert')).toContainText('Choose what T means')
  await sire.getByLabel('Sire meaning for T 2').selectOption('Tremper Albino')
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.locator('.trait-chips')).toContainText('Eclipse')
  await expect(sire.locator('.trait-chips')).toContainText('het (carrier)')
  await page.getByRole('button', { name: 'Calculate offspring' }).click()
  await expect(page.locator('.probability-badge')).toHaveText([
    '25%',
    '50%',
    '25%',
  ])
  await sire.getByLabel('Sire morph search').fill('50% PH TA')
  await sire
    .getByRole('button', { name: 'Review combination / custom label' })
    .click()
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.locator('.trait-chips')).toContainText('50% possible het')
})

test('reviewed shop pairings calculate multi-gene and conditional TUG scenarios', async ({
  page,
}) => {
  await page.goto('/')
  const examples = page.getByLabel('Educational pairing preset')
  await examples.selectOption('market-wachi-7440')
  await expect(page.locator('.source-example')).toContainText('Line: Tremper')
  await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
  await expect(
    page.getByRole('article', { name: 'Tremper Albino probabilities' }),
  ).toHaveCount(0)
  await examples.selectOption('market-wachi-7419')
  await expect(
    page
      .getByRole('article', { name: 'Tremper Albino probabilities' })
      .locator('dd'),
  ).toHaveText(['25%', '50%', '25%'])
  await examples.selectOption('market-hype-multi')
  await expect(
    page
      .getByRole('article', { name: 'Tremper Albino probabilities' })
      .locator('dd'),
  ).toHaveText(['100%', '0%', '0%'])
  await expect(
    page.getByRole('article', { name: 'Eclipse probabilities' }).locator('dd'),
  ).toHaveText(['25%', '50%', '25%'])
  await page
    .getByRole('button', { name: 'Genetics details', exact: true })
    .click()
  await expect(page.locator('.offspring-card')).toHaveCount(12)
  await examples.selectOption('market-wachi-tug')
  await page
    .getByRole('button', { name: 'Simple results', exact: true })
    .click()
  await expect(page.locator('.probability-badge')).toHaveText(['25%', '75%'])
  await expect(page.locator('.source-example')).toContainText(
    'explicitly assumed',
  )
})

test('listing shorthand keeps unknown hets and possible visuals out of confirmed genes', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' })
  await sire.getByLabel('Sire morph search').fill('BS ph. T h. Ecl')
  await sire
    .getByRole('button', { name: 'Review combination / custom label' })
    .click()
  await sire.getByLabel('Sire meaning for T 2').selectOption('Tremper Albino')
  await sire.getByLabel('Sire review tremper 2').selectOption('2/3')
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.locator('.trait-chips')).toContainText(
    '66.67% possible het',
  )
  await expect(sire.locator('.cartoon-art')).toHaveAttribute(
    'data-eyes',
    'slit',
  )
  await sire.getByLabel('Sire morph search').fill('Poss WY Tremper Stripe')
  await sire
    .getByRole('button', { name: 'Review combination / custom label' })
    .click()
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.locator('#Sire-wy-scenario')).toHaveValue('unknown')
  await expect(sire.locator('.trait-chips')).toContainText('Tremper Albino')
  await sire.getByLabel('Sire morph search').fill('Tremper ph. DB')
  await sire
    .getByRole('button', { name: 'Review combination / custom label' })
    .click()
  await sire.getByLabel('Sire review eclipse 2').selectOption('1/2')
  await sire.getByLabel('Sire review blizzard 2').selectOption('1/2')
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.getByRole('alert')).toContainText('independent')
  await sire
    .getByRole('checkbox', {
      name: 'Use independent component-het probabilities for this scenario',
    })
    .check()
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
  await page
    .locator('.library-card')
    .filter({
      has: page.getByRole('heading', { name: 'Lemon Frost', exact: true }),
    })
    .getByRole('button', { name: 'Use in calculator' })
    .click()
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
  expect(summary).toContain('25% Normal / Wild Type')
  expect(summary).toContain('Unlisted active genes assumed not carried')
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
  const offspring = page.locator(
    '.offspring-card figure:first-child .cartoon-art',
  )
  await offspring.scrollIntoViewIfNeeded()
  await expect(offspring).toHaveAttribute('data-body', 'normal')
  await expect(offspring).toHaveAttribute('data-eyes', 'slit')
  await expect(offspring.locator('img')).toHaveJSProperty('complete', true)
  await expect(offspring.locator('img')).not.toHaveJSProperty('naturalWidth', 0)
  await expect(
    page.locator('.offspring-card .cartoon-art[data-body="albino"]'),
  ).toHaveCount(0)
  for (const illustration of await page
    .locator('.offspring-card .cartoon-art')
    .all())
    await expect(illustration).toHaveAttribute('data-eyes', 'slit')
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
    .getByRole('button', { name: 'More options & notes (optional)' })
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

test('dark mode persists, follows the initial device preference, and stays accessible', async ({
  page,
}) => {
  test.setTimeout(90000)
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const theme = page.getByRole('button', { name: 'Dark mode', exact: true })
  await expect(theme).toHaveAttribute('aria-pressed', 'true')
  await theme.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(theme).toHaveAttribute('aria-pressed', 'false')
  await theme.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const audit = async () => {
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(
      r.violations.map((v) => ({
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
    .getByRole('button', { name: 'More options & notes (optional)' })
    .click()
  await audit()
  const nav = page.getByRole('button', { name: 'Toggle navigation' })
  if (await nav.isVisible()) await nav.click()
  await page.getByRole('button', { name: 'Morph library', exact: true }).click()
  await audit()
  if (await nav.isVisible()) await nav.click()
  await page.getByRole('button', { name: 'Genetics 101', exact: true }).click()
  await audit()
})

test('any morph can receive hets and additional traits without opening optional settings', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' })
  const dam = page.getByRole('region', { name: 'Dam parent' })
  for (const name of ['Black Night', 'Tangerine', 'Bold Stripe']) {
    for (const parent of [sire, dam]) {
      await parent.getByRole('textbox', { name: /morph search/ }).fill(name)
      await parent
        .locator('.morph-options button')
        .filter({ has: page.getByText(name, { exact: true }) })
        .click()
    }
    await dam.locator('#Dam-het').selectOption('tremper')
    await expect(dam.locator('.advanced-fields')).toHaveCount(0)
    await page
      .getByRole('button', { name: 'Calculate offspring', exact: true })
      .click()
    const summary = page.getByRole('article', {
      name: 'Tremper Albino probabilities',
    })
    await expect(summary.locator('dd')).toHaveText(['0%', '50%', '50%'])
    await expect(page.locator('.lineage-results')).toContainText(name)
    await page
      .getByRole('button', { name: 'Genetics details', exact: true })
      .click()
    await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
    if (!(await page.locator('.punnett-table').isVisible()))
      await page.locator('.punnett-panel > summary').click()
    await expect(page.locator('.punnett-table')).toBeVisible()
  }
  await sire
    .getByRole('button', { name: '+ Add another visible trait', exact: true })
    .click()
  await sire.getByLabel('Sire morph search').fill('Eclipse')
  await sire
    .locator('.morph-options button')
    .filter({ has: page.getByText('Eclipse', { exact: true }) })
    .click()
  await expect(sire.locator('.trait-chips')).toContainText('Eclipse')
  await expect(sire.getByRole('heading', { level: 3 })).toContainText(
    'Bold Stripe + Eclipse',
  )
  await sire
    .getByRole('button', { name: 'Remove Sire Eclipse', exact: true })
    .click()
  await expect(sire.locator('.cartoon-art')).toHaveAttribute(
    'data-eyes',
    'slit',
  )
})

test('Black Night family stays visible in simple results with honest shade examples', async ({
  page,
}) => {
  await page.goto('/')
  for (const [role, name] of [
    ['Sire', 'Black Night'],
    ['Dam', 'Mack Snow Eclipse Black Night'],
  ]) {
    const parent = page.getByRole('region', { name: `${role} parent` })
    await parent.getByLabel(`${role} morph search`).fill(name)
    await parent
      .locator('.morph-options button')
      .filter({ has: page.getByText(name, { exact: true }) })
      .click()
  }
  await page
    .getByRole('button', { name: 'Calculate offspring', exact: true })
    .click()
  await expect(page.locator('.family-summary')).toContainText(
    'Black Night stays in the family',
  )
  await expect(page.locator('.offspring-card h3')).toHaveText([
    'Black Night line · without Mack Snow',
    'Mack Snow · Black Night line',
  ])
  await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
  for (const card of await page.locator('.offspring-card').all()) {
    await expect(card.locator('.carrier-list')).toContainText(
      'All carry Eclipse (het)',
    )
    await expect(card.locator('.offspring-family-tags')).toContainText(
      'Black Night line',
    )
    await expect(
      card.locator('.cartoon-art[data-body="melanistic"]'),
    ).toHaveCount(1)
    await expect(card.locator('.cartoon-art[data-eyes="slit"]')).toHaveCount(2)
    await expect(
      card.getByText('Lighter example', { exact: true }),
    ).toBeVisible()
    await expect(
      card.getByText('Darker example', { exact: true }),
    ).toBeVisible()
    await expect(card.locator('.outcome-detail')).not.toHaveAttribute('open')
  }
  await page
    .locator('.offspring-card')
    .first()
    .getByText('Why this result?', { exact: false })
    .click()
  await expect(
    page.locator('.offspring-card').first().locator('.outcome-detail'),
  ).toContainText('Eclipse: Ee')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  // The new family guide must remain readable in the user's dark theme too.
  if ((await page.locator('html').getAttribute('data-theme')) !== 'dark')
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(accessibility.violations).toEqual([])
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  for (const role of ['Sire', 'Dam']) {
    const parent = page.getByRole('region', { name: `${role} parent` })
    await parent.getByLabel(`${role} morph search`).fill('Black Night')
    await parent
      .locator('.morph-options button')
      .filter({ has: page.getByText('Black Night', { exact: true }) })
      .click()
  }
  await page
    .getByRole('button', { name: 'Calculate offspring', exact: true })
    .click()
  await expect(page.locator('.family-only-result')).toContainText(
    'Black Night line offspring',
  )
  await expect(page.locator('.probability-badge')).toHaveCount(0)
})

test('Black Night Tangerine Stripe and typed h MP combine directly without optional settings', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' })
  const dam = page.getByRole('region', { name: 'Dam parent' })
  await sire
    .getByLabel('Sire morph search')
    .fill('black night tangerine stripe')
  await sire
    .locator('.morph-options button')
    .filter({
      has: page.getByText('Black Night Tangerine Stripe', { exact: true }),
    })
    .click()
  await dam.getByLabel('Dam morph search').fill('black ngiht h MP')
  await expect(
    dam.getByRole('button', {
      name: 'Use Black Night · Het Murphy Patternless Combination',
      exact: true,
    }),
  ).toBeVisible()
  await dam.getByLabel('Dam morph search').press('Enter')
  await expect(dam.locator('.trait-chips')).toContainText('Murphy Patternless')
  await expect(dam.locator('.trait-chips')).toContainText('het (carrier)')
  await expect(page.locator('.advanced-fields')).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Calculate offspring', exact: true })
    .click()
  await expect(
    page
      .getByRole('article', { name: 'Murphy Patternless probabilities' })
      .locator('dd'),
  ).toHaveText(['0%', '50%', '50%'])
  await expect(page.locator('.family-summary')).toContainText(
    'Black Night + Tangerine + Stripe',
  )
  await expect(
    page.locator('.offspring-card .cartoon-art[data-pattern="patternless"]'),
  ).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Genetics details', exact: true })
    .click()
  await expect(page.locator('.probability-badge')).toHaveText(['50%', '50%'])
  await page
    .getByLabel('Educational pairing preset')
    .selectOption('black-night-stripe-mp')
  await expect(
    page
      .getByRole('article', { name: 'Murphy Patternless probabilities' })
      .locator('dd'),
  ).toHaveText(['0%', '50%', '50%'])
})

test('Faunary description labels are selectable and possible het MP stays unknown until supplied', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' })
  await sire.getByLabel('Sire morph search').fill('Pandora CT')
  await sire
    .locator('.source-morph-option')
    .filter({ has: page.getByText('Pandora CT', { exact: true }) })
    .click()
  await expect(sire.getByRole('heading', { level: 3 })).toContainText('Pandora')
  await expect(sire.getByRole('heading', { level: 3 })).toContainText(
    'Carrot Tail',
  )
  await sire.getByLabel('Sire morph search').fill('Bn pht mp')
  await sire
    .locator('.source-morph-option')
    .filter({ has: page.getByText('Bn pht mp', { exact: true }) })
    .click()
  await expect(sire.getByLabel('Sire review patternless 2')).toHaveValue(
    'unknown',
  )
  await sire
    .getByRole('button', { name: 'Confirm recognized traits', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Calculate offspring', exact: true })
    .click()
  await expect(page.locator('.results-section')).toContainText(
    'More information needed for Murphy Patternless',
  )
  await expect(
    page.getByRole('article', { name: 'Murphy Patternless probabilities' }),
  ).toHaveCount(0)
  await sire
    .getByLabel('Sire morph search')
    .fill('Hypo Tangerine het Tremper ph RAPTOR')
  await sire
    .getByRole('button', { name: 'Review combination / custom label' })
    .click()
  await expect(sire.getByLabel('Sire review tremper 4')).toHaveCount(0)
  await expect(
    sire.getByRole('checkbox', {
      name: 'Use independent component-het probabilities for this scenario',
    }),
  ).toHaveCount(0)
  await sire.getByLabel('Sire review eclipse 4').selectOption('2/3')
  await sire
    .getByRole('button', { name: 'Confirm recognized traits', exact: true })
    .click()
  await expect(sire.locator('.trait-chips')).toContainText(
    '66.67% possible het',
  )
  const nav = page.getByRole('button', { name: 'Toggle navigation' })
  if (await nav.isVisible()) await nav.click()
  await page.getByRole('button', { name: 'Morph library', exact: true }).click()
  await page.getByLabel('Search morph library').fill('Pandora')
  await page.getByLabel('Filter catalog source').selectOption('faunary')
  await expect(page.locator('.library-card')).toHaveCount(1)
  await expect(page.locator('.library-card')).toContainText(
    'No albino strain, hidden gene',
  )
})

test('combination text, albino strain choice and dominant scenarios work in the main controls', async ({
  page,
}) => {
  await page.goto('/')
  const sire = page.getByRole('region', { name: 'Sire parent' })
  await sire.getByLabel('Sire morph search').fill('Black Night het Tremper')
  await sire
    .getByRole('button', { name: 'Review combination / custom label' })
    .click()
  await sire.getByRole('button', { name: 'Confirm recognized traits' }).click()
  await expect(sire.locator('.trait-chips')).toContainText('het (carrier)')
  await expect(sire.locator('.cartoon-art')).toHaveAttribute(
    'data-body',
    'melanistic',
  )
  await sire.getByLabel('Sire morph search').fill('Sunglow')
  await sire
    .locator('.morph-options button')
    .filter({ has: page.getByText('Sunglow', { exact: true }) })
    .click()
  await sire.locator('#Sire-albino-strain').selectOption('bell')
  await expect(sire.locator('.trait-chips')).toContainText('Bell Albino')
  await expect(sire.locator('.advanced-fields')).toHaveCount(0)
  await sire.getByLabel('Sire morph search').fill('White & Yellow')
  await sire
    .locator('.morph-options button')
    .filter({ has: page.getByText('White & Yellow', { exact: true }) })
    .click()
  await sire.locator('#Sire-wy-scenario').selectOption('1')
  await page
    .getByRole('button', { name: 'Calculate offspring', exact: true })
    .click()
  await expect(
    page
      .getByRole('article', { name: 'White & Yellow probabilities' })
      .locator('dd'),
  ).toHaveText(['50%', '50%'])
})
