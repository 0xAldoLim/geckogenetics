import { useId } from 'react'
export type Appearance =
  | 'normal'
  | 'snow'
  | 'super'
  | 'albino'
  | 'tangerine'
  | 'hypo'
  | 'melanistic'
  | 'blizzard'
export function appearanceFor(title: string): Appearance {
  if (/black night|black pearl/i.test(title)) return 'melanistic'
  if (/albino|sunglow|raptor/i.test(title)) return 'albino'
  if (/super snow/i.test(title)) return 'super'
  if (/snow/i.test(title)) return 'snow'
  if (/blizzard|patternless/i.test(title)) return 'blizzard'
  if (/tangerine|shtct|carrot/i.test(title)) return 'tangerine'
  if (/hypo/i.test(title)) return 'hypo'
  return 'normal'
}
/** Original hand-drawn vector artwork. Pattern and color are artistic, never a phenotype simulation. */
export default function MorphIllustration({
  appearance = 'normal',
  flip = false,
  className = '',
}: {
  appearance?: Appearance
  flip?: boolean
  className?: string
}) {
  const uid = useId().replaceAll(':', '')
  const palettes: Record<Appearance, [string, string, string]> = {
    normal: ['#efce66', '#d3a744', '#463e31'],
    snow: ['#e9e7ce', '#c4bc87', '#4c493e'],
    super: ['#e9e8e0', '#cac8be', '#383a34'],
    albino: ['#f5d49b', '#e4a969', '#a87565'],
    tangerine: ['#eda64c', '#cf7438', '#6b4a30'],
    hypo: ['#f4cf6b', '#dca752', '#695039'],
    melanistic: ['#575c4b', '#303c32', '#242b24'],
    blizzard: ['#e8ded6', '#c4b7bb', '#95868f'],
  }
  const [light, dark, spot] = palettes[appearance]
  const spots = [
    [113, 84, 5],
    [127, 100, 4],
    [137, 76, 5],
    [144, 113, 6],
    [160, 87, 4],
    [170, 106, 5],
    [182, 78, 5],
    [194, 97, 6],
    [205, 114, 4],
    [217, 88, 5],
    [231, 106, 4],
    [239, 83, 5],
    [253, 99, 5],
    [267, 84, 4],
    [277, 106, 5],
    [296, 82, 3],
    [306, 101, 4],
    [111, 105, 3],
    [154, 69, 3],
    [186, 119, 4],
    [224, 72, 3],
    [259, 117, 4],
  ]
  return (
    <svg
      viewBox="0 0 420 210"
      className={`gecko-art ${className}`}
      role="img"
      aria-label={`${appearance} leopard gecko illustration`}
    >
      <defs>
        <clipPath id={`${uid}outline`}>
          <path d="M117 77C147 59 192 65 221 70C257 75 268 103 249 124C226 146 169 142 131 121C116 112 111 93 117 77ZM131 78C116 63 94 63 75 70C60 76 43 89 46 100C48 112 74 124 96 122C119 121 133 108 137 97ZM244 104C275 111 298 131 324 143C348 154 374 148 385 134C369 168 331 177 300 159C270 143 253 133 234 126Z" />
        </clipPath>
        <linearGradient id={`${uid}skin`} x1="0" y1="0" x2="0.2" y2="1">
          <stop stopColor={light} />
          <stop offset=".55" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <pattern
          id={`${uid}scales`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="#fff" opacity=".2" />
          <circle cx="5" cy="5" r=".8" fill="#352f21" opacity=".10" />
        </pattern>
        <filter
          id={`${uid}shadow`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="5"
            floodColor="#62563d"
            floodOpacity=".15"
          />
        </filter>
      </defs>
      <ellipse
        cx="211"
        cy="174"
        rx="120"
        ry="8"
        fill="#344b32"
        opacity=".055"
      />
      <g transform={flip ? 'translate(420 0) scale(-1 1)' : undefined}>
        <g transform="rotate(-12 210 103)" filter={`url(#${uid}shadow)`}>
          <g
            fill={`url(#${uid}skin)`}
            stroke={dark}
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            <path d="M244 104C275 111 298 131 324 143C348 154 374 148 385 134C369 168 331 177 300 159C270 143 253 133 234 126Z" />
            <path d="M148 81L128 57L104 58L93 40L98 38L111 51L135 47L162 70Z" />
            <path d="M152 116L130 143L107 142L96 159L101 162L114 150L141 154L169 131Z" />
            <path d="M224 78L249 52L268 52L279 38L283 42L274 61L254 64L239 92Z" />
            <path d="M226 120L248 145L269 144L280 160L285 157L276 136L256 133L242 106Z" />
            <path d="M117 77C147 59 192 65 221 70C257 75 268 103 249 124C226 146 169 142 131 121C116 112 111 93 117 77Z" />
            <path d="M131 78C116 63 94 63 75 70C60 76 43 89 46 100C48 112 74 124 96 122C119 121 133 108 137 97Z" />
          </g>
          <g fill="none" stroke={dark} strokeWidth="2.2" strokeLinecap="round">
            <path d="M98 40l-7-5m8 7l-1-11m-1 13l-12-3M99 159l-12 4m15-3l-4 12m7-14l3 11M280 41l4-10m-3 13l12-4m-14 0l-2-12M283 158l12 4m-14-1l1 12m-3-15l-6 10" />
          </g>
          {appearance !== 'blizzard' && appearance !== 'hypo' && (
            <g clipPath={`url(#${uid}outline)`} fill={spot} opacity=".9">
              {spots.map(([x, y, r], i) => (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx={r}
                  ry={r * 0.74}
                  transform={`rotate(${i * 29} ${x} ${y})`}
                />
              ))}
              <path d="M278 124l8 5-9 17-8-5zm22 16l8 4-6 17-8-5zm25 10l9 1-2 16-10-2zm25-2l8-3 5 13-8 4z" />
              <circle cx="75" cy="84" r="3" />
              <circle cx="91" cy="76" r="3" />
              <circle cx="104" cy="87" r="4" />
              <circle cx="84" cy="104" r="3" />
              <circle cx="102" cy="110" r="3" />
            </g>
          )}
          <path
            d="M121 79C154 67 211 72 240 85C252 105 246 124 217 132C170 137 144 123 124 110Z"
            fill={`url(#${uid}scales)`}
          />
          <ellipse cx="69" cy="75" rx="9" ry="8" fill={dark} />
          <ellipse
            cx="69"
            cy="74"
            rx="6"
            ry="6"
            fill={appearance === 'albino' ? '#a25843' : '#a0a776'}
          />
          <ellipse cx="69" cy="74" rx="1.7" ry="5.5" fill="#262d26" />
          <circle cx="67" cy="72" r="1.4" fill="#fff" />
          <path
            d="M48 99C62 104 70 105 77 102"
            fill="none"
            stroke={spot}
            strokeWidth="1.2"
          />
          <circle cx="49" cy="91" r="1.4" fill={spot} />
          <path
            d="M139 79C165 72 203 76 218 81"
            stroke="#fff"
            strokeWidth="3"
            opacity=".3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  )
}
