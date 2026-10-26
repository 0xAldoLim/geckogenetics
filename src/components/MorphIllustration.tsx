import { useId } from 'react'
import {
  appearanceForMorph,
  normalAppearance,
  assetForAppearance,
  appearanceDescription,
} from '../genetics/appearance'
import type { VisualProfile } from '../genetics/appearance'
import CartoonEyes from './CartoonEyes'

export const appearanceFor = appearanceForMorph
export default function MorphIllustration({
  appearance = normalAppearance(),
  flip = false,
  className = '',
}: {
  appearance?: VisualProfile
  flip?: boolean
  className?: string
}) {
  const id = useId().replaceAll(':', '')
  const asset = assetForAppearance(appearance)
  const url = `${import.meta.env.BASE_URL}illustrations/${asset}.webp`
  const bare = `${import.meta.env.BASE_URL}illustrations/blizzard.webp`
  const description = appearanceDescription(appearance)
  const variantDefaults: Record<string, string> = {
    normal: 'normal',
    snow: 'snow',
    super: 'snow',
    albino: 'albino',
    tangerine: 'tangerine',
    melanistic: 'melanistic',
  }
  const tint = appearance.body !== (variantDefaults[asset] ?? 'normal')
  const tone =
    appearance.body === 'melanistic'
      ? '#353039'
      : appearance.body === 'dark-tangerine'
        ? '#8a4c29'
        : appearance.body === 'tangerine'
          ? '#e58326'
          : appearance.body === 'snow'
            ? '#d2d2cf'
            : appearance.body === 'albino'
              ? '#e4b792'
              : '#e2be62'
  return (
    <div
      className={`gecko-art cartoon-art ${className}`}
      role="img"
      aria-label={description}
      title={`${description}. Illustrative appearance, not guaranteed phenotype.`}
      data-body={appearance.body}
      data-pattern={appearance.pattern}
      data-eyes={appearance.eyes}
      data-asset={asset}
      data-white-sides={appearance.whiteSides}
    >
      <div className={`cartoon-frame ${flip ? 'cartoon-flipped' : ''}`}>
        <img
          className="cartoon-gecko"
          src={url}
          alt=""
          width="960"
          height="640"
          loading="lazy"
          decoding="async"
          draggable="false"
          style={
            asset === 'blizzard' && appearance.body === 'melanistic'
              ? { filter: 'brightness(.52) saturate(.5)' }
              : tint
                ? { filter: `url(#${id}-body-tone)` }
                : undefined
          }
        />
        <svg
          className="cartoon-modifiers"
          viewBox="0 0 1536 1024"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter
              id={`${id}-body-tone`}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 0 -1 0 -.10"
                result="warm-regions"
              />
              <feComponentTransfer in="warm-regions" result="skin-mask">
                <feFuncA type="table" tableValues="0 .4 .9 1 1" />
              </feComponentTransfer>
              <feComposite
                in="skin-mask"
                in2="SourceAlpha"
                operator="in"
                result="masked-skin"
              />
              <feFlood floodColor={tone} result="body-color" />
              <feComposite
                in="body-color"
                in2="masked-skin"
                operator="in"
                result="body-overlay"
              />
              <feBlend
                in="body-overlay"
                in2="SourceGraphic"
                mode={
                  appearance.body === 'melanistic' ||
                  appearance.body === 'dark-tangerine'
                    ? 'multiply'
                    : 'color'
                }
              />
            </filter>
            <mask id={`${id}-animal`} maskContentUnits="userSpaceOnUse">
              <image href={url} x="0" y="0" width="1536" height="1024" />
            </mask>
            <clipPath id={`${id}-head`}>
              <path d="M30 95H550L560 360 530 430 405 475 180 450 30 350Z" />
            </clipPath>
            <clipPath id={`${id}-tail`}>
              <path d="M1050 420H1536V940H1250L1140 700 1090 570Z" />
            </clipPath>
            <clipPath id={`${id}-feet`}>
              <path d="M80 645H330V840H80ZM450 675H700V900H450ZM1010 650H1240V890H1010ZM700 670H875V790H700Z" />
            </clipPath>
            <clipPath id={`${id}-neck`}>
              <path d="M530 340Q620 390 650 540L535 600 440 460Z" />
            </clipPath>
          </defs>
          {(appearance.head === 'bald' || appearance.head === 'white') &&
            appearance.pattern !== 'patternless' && (
              <image
                href={bare}
                x="0"
                y="0"
                width="1536"
                height="1024"
                clipPath={`url(#${id}-head)`}
              />
            )}
          {appearance.tail === 'white' &&
            appearance.pattern !== 'patternless' && (
              <image
                href={bare}
                x="0"
                y="0"
                width="1536"
                height="1024"
                clipPath={`url(#${id}-tail)`}
              />
            )}
          <g mask={`url(#${id}-animal)`}>
            {appearance.whiteFeet && (
              <image
                href={bare}
                x="0"
                y="0"
                width="1536"
                height="1024"
                clipPath={`url(#${id}-feet)`}
              />
            )}
            {appearance.whiteNeck && (
              <image
                href={bare}
                x="0"
                y="0"
                width="1536"
                height="1024"
                clipPath={`url(#${id}-neck)`}
              />
            )}
            {appearance.whiteSides && (
              <path
                d="M560 490C685 525 795 492 930 535L1100 580 1110 645C940 625 755 675 600 610Z"
                fill="#fffdf6"
              />
            )}
            {appearance.pattern === 'reduced-spots' && (
              <g fill="#594030">
                <ellipse cx="710" cy="453" rx="18" ry="13" />
                <ellipse cx="825" cy="490" rx="22" ry="14" />
                <ellipse cx="934" cy="448" rx="16" ry="11" />
                <ellipse cx="1045" cy="502" rx="18" ry="12" />
              </g>
            )}
            {appearance.pattern === 'reverse-stripe' && (
              <path
                d="M575 395C735 390 850 425 1075 448"
                fill="none"
                stroke="#584032"
                strokeWidth="35"
                strokeLinecap="round"
              />
            )}
            {appearance.pattern === 'broken-stripe' && (
              <path
                d="M575 395C735 390 850 425 1075 448"
                fill="none"
                stroke="#584032"
                strokeWidth="35"
                strokeDasharray="65 27"
                strokeLinecap="round"
              />
            )}
            {appearance.pattern === 'circle-back' && (
              <ellipse
                cx="830"
                cy="485"
                rx="153"
                ry="65"
                fill="none"
                stroke="#584032"
                strokeWidth="23"
                transform="rotate(7 830 485)"
              />
            )}
            {appearance.pattern === 'banded' && (
              <path
                d="M620 380Q650 500 620 610M775 400Q805 535 780 650M930 415Q960 540 950 635"
                fill="none"
                stroke="#584032"
                strokeWidth="53"
              />
            )}
            {appearance.head === 'bandit' && (
              <path
                d="M80 268Q150 230 232 247L235 272Q146 258 90 292Z"
                fill="#4e3529"
              />
            )}
            {appearance.head === 'carrot' && (
              <path
                d="M30 95H550L560 360 530 430 405 475 180 450 30 350Z"
                fill="#ec7e23"
                style={{ mixBlendMode: 'color' }}
              />
            )}
          </g>
          {appearance.tail === 'carrot' && (
            <g mask={`url(#${id}-animal)`} style={{ mixBlendMode: 'color' }}>
              <path
                d="M1035 405C1190 400 1315 460 1415 560L1460 695C1350 730 1160 655 1090 620Z"
                fill="#e96d17"
              />
            </g>
          )}
        </svg>
        <CartoonEyes appearance={appearance.eyes} />
      </div>
    </div>
  )
}
