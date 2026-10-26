import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Dna,
  Heart,
  Leaf,
  Link,
  Menu,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  X,
} from 'lucide-react'
import { blankParent } from './genetics/traits'
import type { Pairing } from './genetics/traits'
import { applyMorph, morphs, preset } from './data/morphs'
import { compareObservation } from './genetics/observations'
import {
  decodePairing,
  encodePairing,
  readSaved,
  SAVED_KEY,
  savedSchema,
} from './lib/storage'
import type { SavedPair } from './lib/storage'
import ParentSelector from './components/ParentSelector'
import Results from './components/Results'
import Encyclopedia from './pages/Encyclopedia'
import Learn from './pages/Learn'
type Page = 'calculator' | 'library' | 'learn' | 'saved'
function initialPair(): Pairing {
  try {
    const encoded = new URLSearchParams(location.hash.slice(1)).get('pair')
    if (encoded) return decodePairing(encoded)
  } catch {
    /* Visible error is shown after mount. */
  }
  return preset('snow')
}
export default function App() {
  const [pair, setPair] = useState<Pairing>(initialPair)
  const [calculated, setCalculated] = useState<Pairing>(pair)
  const [page, setPage] = useState<Page>('calculator')
  const [librarySearch, setLibrarySearch] = useState('')
  const [notice, setNotice] = useState('')
  const [saved, setSaved] = useState<SavedPair[]>([])
  const [mobileNav, setMobileNav] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )
  const [shareLink, setShareLink] = useState('')
  const [activePreset, setActivePreset] = useState('snow')
  const [observationResult, setObservationResult] = useState('')
  const notifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirty = JSON.stringify(pair) !== JSON.stringify(calculated)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#111b16' : '#214d39')
  }, [theme])
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('geckogenetics.theme', next)
    } catch {
      // The toggle still works when browser storage is unavailable.
    }
  }
  function notify(message: string) {
    setNotice(message)
    if (notifyTimer.current) clearTimeout(notifyTimer.current)
    notifyTimer.current = setTimeout(() => setNotice(''), 7000)
  }
  useEffect(() => {
    try {
      setSaved(readSaved())
    } catch {
      setNotice(
        'Saved pairings could not be read. Your browser data has not been overwritten.',
      )
    }
    try {
      const encoded = new URLSearchParams(location.hash.slice(1)).get('pair')
      if (encoded) {
        decodePairing(encoded)
        setNotice(
          'Shared pairing restored. Review the entered genotypes and evidence.',
        )
      }
    } catch {
      setNotice(
        'This pairing link is invalid or unsupported. Showing the Mack Snow example instead.',
      )
    }
    return () => {
      if (notifyTimer.current) clearTimeout(notifyTimer.current)
    }
  }, [])
  function navigate(next: Page) {
    setPage(next)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function reference(query: string) {
    const entry =
      morphs.find((m) => m.name === query) ??
      morphs.find((m) => query.toLowerCase().startsWith(m.name.toLowerCase()))
    setLibrarySearch(entry?.name ?? query)
    navigate('library')
  }
  function loadPreset(id: string) {
    const next = preset(id as Parameters<typeof preset>[0])
    setPair(next)
    setCalculated(next)
    setActivePreset(id)
    setObservationResult('')
  }
  function savePair() {
    try {
      const current = readSaved()
      if (current.length >= 20) {
        notify('You have 20 saved pairings. Remove one to save another.')
        return
      }
      const next = savedSchema.parse([
        ...current,
        {
          id: crypto.randomUUID(),
          title:
            `${pair.sire.name || pair.sire.morph} × ${pair.dam.name || pair.dam.morph}`.slice(
              0,
              220,
            ),
          pair,
        },
      ])
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setSaved(next)
      notify('Pairing saved on this device.')
    } catch {
      notify(
        'Could not save this pairing. Browser storage may be full, unavailable, or contain invalid data.',
      )
    }
  }
  function deletePair(id: string) {
    try {
      const next = readSaved().filter((s) => s.id !== id)
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setSaved(next)
      notify('Saved pairing removed.')
    } catch {
      notify('Could not update saved pairings.')
    }
  }
  async function share() {
    const url = new URL(location.href)
    try {
      url.hash = new URLSearchParams({ pair: encodePairing(pair) }).toString()
    } catch {
      notify(
        'This pairing is too large or contains invalid settings. Shorten the notes or labels before sharing.',
      )
      return
    }
    setShareLink(url.href)
    try {
      await navigator.clipboard.writeText(url.href)
      notify(
        'Pairing link copied. It includes your notes and parentage; review before sharing.',
      )
    } catch {
      notify('Your pairing link is ready below. Select it to copy.')
    }
  }
  function updatePair(next: Pairing) {
    setPair(next)
    setActivePreset('')
    setObservationResult('')
  }
  function calculateNow() {
    setCalculated(pair)
    setShareLink('')
    requestAnimationFrame(() =>
      document.getElementById('results')?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      }),
    )
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate('calculator')
            }}
          >
            <span className="brand-mark">
              <Dna size={26} />
            </span>
            <span>
              Gecko<span>Genetics</span>
              <small>A LITTLE SCIENCE. A WORLD OF POSSIBILITY.</small>
            </span>
          </a>
          <button
            className="theme-toggle icon-button"
            aria-label="Dark mode"
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNav}
          >
            {mobileNav ? <X /> : <Menu />}
          </button>
          <nav className={mobileNav ? 'open' : ''} aria-label="Main navigation">
            <button
              className={page === 'calculator' ? 'nav-active' : ''}
              onClick={() => navigate('calculator')}
            >
              <Dna size={16} /> Calculator
            </button>
            <button
              className={page === 'library' ? 'nav-active' : ''}
              onClick={() => {
                setLibrarySearch('')
                navigate('library')
              }}
            >
              <BookOpen size={16} /> Morph library
            </button>
            <button
              className={page === 'learn' ? 'nav-active' : ''}
              onClick={() => navigate('learn')}
            >
              Genetics 101
            </button>
            <span className="nav-divider" />
            <button
              className={`saved-nav ${page === 'saved' ? 'nav-active' : ''}`}
              onClick={() => navigate('saved')}
            >
              <Bookmark size={16} /> Saved pairings <span>{saved.length}</span>
            </button>
          </nav>
        </div>
      </header>
      <main id="main">
        {page === 'calculator' && (
          <>
            <section className="hero">
              <div>
                <div className="species-badge">
                  <span /> THE LEOPARD GECKO GENETICS CALCULATOR
                </div>
                <h1>
                  Small geckos.
                  <br />
                  Big <em>possibilities.</em>
                </h1>
                <p>
                  Meet the science behind your next generation.
                  <br className="desktop-break" /> Pair their traits. Explore
                  the outcomes. Understand the why.
                </p>
                <div className="hero-benefits">
                  <span>
                    <Check size={13} /> Free to explore
                  </span>
                  <span>
                    <Check size={13} /> Grounded in genetics
                  </span>
                  <span>
                    <Check size={13} /> No account needed
                  </span>
                </div>
              </div>
              <aside className="hero-note">
                <span className="note-doodle">✳</span>
                <span className="eyebrow">CURIOSITY, MEET CLARITY.</span>
                <p>
                  A little less guesswork.
                  <br />A little more <em>understanding.</em>
                </p>
                <div>
                  <Dna size={17} />
                  <span>
                    Made for the endlessly curious
                    <br />
                    and the carefully considered.
                  </span>
                </div>
              </aside>
            </section>
            <div className="workspace-heading">
              <div>
                <span className="step-number">01</span>
                <h2>Meet the parents</h2>
                <span className="muted desktop-only">
                  Every possibility starts with a pair.
                </span>
              </div>
              <div className="pairing-tools">
                <button
                  title="Exchange parent settings and recalculate"
                  onClick={() => {
                    const next = { ...pair, sire: pair.dam, dam: pair.sire }
                    updatePair(next)
                    setCalculated(next)
                    notify('Parents swapped and results updated.')
                  }}
                >
                  <ArrowLeftRight size={14} /> Swap
                </button>
                <button
                  title="Clear both parents"
                  onClick={() => {
                    const next: Pairing = {
                      version: 1,
                      sire: blankParent(),
                      dam: blankParent(),
                      observed: '',
                      assumeUnlisted: true,
                    }
                    updatePair(next)
                    setCalculated(next)
                    setShareLink('')
                  }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>
            <div className="parent-grid">
              <ParentSelector
                role="Sire"
                parent={pair.sire}
                onChange={(sire) => updatePair({ ...pair, sire })}
                onReference={reference}
              />
              <div
                className="cross-symbol"
                title="Genetic cross"
                aria-label="crossed with"
              >
                ×
              </div>
              <ParentSelector
                role="Dam"
                parent={pair.dam}
                onChange={(dam) => updatePair({ ...pair, dam })}
                onReference={reference}
              />
            </div>
            <div className="calculator-actions">
              <div className="preset-picker">
                <span className="field-label">A LITTLE INSPIRATION</span>
                <label>
                  <select
                    aria-label="Educational pairing preset"
                    value={activePreset}
                    onChange={(e) => loadPreset(e.target.value)}
                  >
                    <option value="" disabled>
                      Choose an example pairing
                    </option>
                    <option value="snow">Mack Snow × Mack Snow</option>
                    <option value="sunglow-a">
                      Sunglow × SHTCT · dam non-carrier
                    </option>
                    <option value="sunglow-b">
                      Sunglow × SHTCT · dam het Tremper
                    </option>
                    <option value="labs">Gecko Labs · Tremper / Eclipse</option>
                    <option value="black-night">
                      Black Night × Black Night het Tremper
                    </option>
                  </select>
                  <ChevronDown size={15} />
                </label>
              </div>
              <div className="action-buttons">
                <button
                  className="secondary-button"
                  onClick={savePair}
                  title="Save this pairing in this browser"
                >
                  <Bookmark size={16} /> Save pairing
                </button>
                <button
                  className="icon-button share-button"
                  onClick={share}
                  title="Copy a link including pairing notes"
                  aria-label="Share pairing"
                >
                  <Link size={19} />
                </button>
                <button
                  className="primary-button calculate-button"
                  onClick={calculateNow}
                >
                  <Dna size={18} /> Calculate offspring <ArrowDown size={17} />
                </button>
              </div>
            </div>
            <div className="estimate-options">
              <label>
                <input
                  type="checkbox"
                  checked={pair.assumeUnlisted === true}
                  onChange={(e) =>
                    updatePair({ ...pair, assumeUnlisted: e.target.checked })
                  }
                />
                Assume unlisted genes are not carried
              </label>
              <p>
                Used for a standard pairing estimate. Add known hets above. Turn
                this off if unlisted status is unknown; an explicitly unknown
                entry always stays unknown.
              </p>
            </div>
            {shareLink && (
              <label className="share-output">
                Shareable link · includes evidence notes
                <input
                  readOnly
                  aria-label="Shareable pairing link"
                  value={shareLink}
                  onFocus={(e) => e.target.select()}
                />
              </label>
            )}
            <div className="science-note">
              <ShieldCheck size={17} />
              <p>
                Results use the traits and assumptions you select. Breeder notes
                are optional; appearance alone cannot identify hidden genes.
              </p>
              <button onClick={() => navigate('learn')}>
                How it works <ArrowUpRightIcon />
              </button>
            </div>
            {dirty && (
              <div className="notice pending-notice" role="status">
                Parent settings changed. Select Calculate offspring to update
                the results below.
              </div>
            )}
            <Results
              pair={calculated}
              onReference={reference}
              notify={notify}
            />
            <details className="observation-panel">
              <summary>
                Have an observed hatchling? Keep observations separate.{' '}
                <span>+</span>
              </summary>
              <p className="small muted">
                Record a label for comparison. A visual observation cannot
                establish unknown parental alleles or identify an albino strain.
              </p>
              <label className="field-label" htmlFor="observed">
                OBSERVED HATCHLING LABEL
              </label>
              <div>
                <input
                  id="observed"
                  placeholder="e.g. MSEBN PH T"
                  maxLength={500}
                  value={pair.observed}
                  onChange={(e) => {
                    setPair({ ...pair, observed: e.target.value })
                    setObservationResult('')
                  }}
                />
                <button
                  className="small-button"
                  onClick={() => {
                    setObservationResult(
                      compareObservation(calculated, pair.observed),
                    )
                    setCalculated({ ...calculated, observed: pair.observed })
                  }}
                >
                  Compare with predictions
                </button>
              </div>
              {observationResult && (
                <p role="status" className="notice">
                  {observationResult}
                </p>
              )}
            </details>
            <section className="education-banner">
              <div className="education-banner-icon">
                <BookOpen size={29} />
              </div>
              <div>
                <span className="eyebrow">THERE’S A STORY IN EVERY SPOT.</span>
                <h2>New to hets, snows, and Punnett squares?</h2>
                <p>
                  Get comfortable with the basics, one little discovery at a
                  time.
                </p>
              </div>
              <button className="text-button" onClick={() => navigate('learn')}>
                Let’s learn genetics <ArrowRight size={17} />
              </button>
            </section>
          </>
        )}
        {page === 'library' && (
          <Encyclopedia
            key={librarySearch}
            initialSearch={librarySearch}
            onUse={(name) => {
              const morph = morphs.find((m) => m.name === name)!
              updatePair({ ...pair, sire: applyMorph(pair.sire, morph) })
              navigate('calculator')
              notify(
                `${name} selected for the sire. Review the dam’s genetics before calculating.`,
              )
            }}
          />
        )}
        {page === 'learn' && (
          <Learn
            onPreset={() => {
              loadPreset('sunglow-a')
              navigate('calculator')
            }}
          />
        )}
        {page === 'saved' && (
          <section className="saved-page">
            <span className="eyebrow">YOUR LITTLE COLLECTION</span>
            <h1>Saved pairings.</h1>
            <p>
              Stored only in this browser, on this device. Up to 20 pairings.
            </p>
            {saved.length ? (
              <div className="saved-list">
                {saved.map((s) => (
                  <article key={s.id}>
                    <span className="saved-icon">
                      <Bookmark size={22} />
                    </span>
                    <div>
                      <h2>{s.title}</h2>
                      <p>
                        {s.pair.sire.evidence || 'No sire evidence recorded.'}
                      </p>
                    </div>
                    <button
                      className="small-button"
                      onClick={() => {
                        setPair(s.pair)
                        setCalculated(s.pair)
                        setActivePreset('')
                        navigate('calculator')
                        notify('Saved pairing restored.')
                      }}
                    >
                      Load pairing <ArrowRight size={14} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${s.title}`}
                      onClick={() => deletePair(s.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Bookmark size={32} />
                <h2>Your next discovery starts here.</h2>
                <p>
                  Save a pairing from the calculator to come back to it later.
                </p>
                <button
                  className="primary-button"
                  onClick={() => navigate('calculator')}
                >
                  Explore a pairing <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        )}
      </main>
      <footer>
        <div>
          <a
            href="#"
            className="footer-brand"
            onClick={(e) => {
              e.preventDefault()
              navigate('calculator')
            }}
          >
            <Dna size={19} /> GeckoGenetics
          </a>
          <p>Understand the genetics. Respect the gecko.</p>
        </div>
        <div>
          <span>
            <Leaf size={13} /> Science with curiosity.
          </span>
          <span>
            <Heart size={13} /> Welfare at heart.
          </span>
          <small>
            Illustrations are artistic guides. Genetics are conditional, never a
            guarantee.
          </small>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  )
}
function ArrowUpRightIcon() {
  return <span aria-hidden="true">↗</span>
}
