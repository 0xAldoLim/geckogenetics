import { useId } from 'react'
import type { EyeAppearance } from '../genetics/appearance'

/** Eye-only vector layer over the generated cartoon; body pixels remain unchanged. */
export default function CartoonEyes({
  appearance,
  cx = 337,
  cy = 278,
}: {
  appearance: EyeAppearance
  cx?: number
  cy?: number
}) {
  const id = useId().replaceAll(':', '')
  const solid = appearance === 'solid-black' || appearance === 'solid-red'
  const red = appearance === 'solid-red' || appearance === 'albino-slit'
  const dark = appearance === 'dark-marbled'
  return (
    <svg
      className="cartoon-eyes"
      viewBox="0 0 1536 1024"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-eye-modification={appearance}
    >
      <defs>
        <clipPath id={`${id}-iris`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx="53"
            ry="61"
            transform={`rotate(10 ${cx} ${cy})`}
          />
        </clipPath>
        <radialGradient id={`${id}-iris-color`}>
          <stop
            stopColor={
              solid
                ? red
                  ? '#b83c4d'
                  : '#30343e'
                : appearance === 'blue-amber'
                  ? '#e4a53d'
                  : dark
                    ? '#64606e'
                    : red
                      ? '#c7815f'
                      : '#e8b447'
            }
          />
          <stop
            offset="1"
            stopColor={
              solid
                ? red
                  ? '#420d1c'
                  : '#10131a'
                : appearance === 'blue-amber'
                  ? '#5398ab'
                  : dark
                    ? '#27252e'
                    : red
                      ? '#874633'
                      : '#9d7024'
            }
          />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}-iris)`}>
        <rect
          x={cx - 70}
          y={cy - 80}
          width="140"
          height="160"
          fill={`url(#${id}-iris-color)`}
        />
        {!solid && (
          <ellipse cx={cx - 3} cy={cy + 2} rx="10" ry="53" fill="#17191c" />
        )}
        {(appearance === 'marbled' || dark) && (
          <g
            fill="none"
            stroke={dark ? '#aea1a9' : '#53463e'}
            strokeWidth="12"
            opacity=".85"
          >
            <path
              d={`M${cx - 55} ${cy - 38}q45 38 12 57t52 32M${cx + 25} ${cy - 65}q-35 35 14 55t-10 63`}
            />
            <path d={`M${cx - 58} ${cy + 25}q34-36 84-14`} strokeWidth="8" />
          </g>
        )}
        {appearance === 'snake-eye' && (
          <rect
            x={cx - 70}
            y={cy - 80}
            width="70"
            height="160"
            fill="#12151b"
          />
        )}
        <ellipse
          cx={cx - 19}
          cy={cy - 33}
          rx="10"
          ry="14"
          fill="#fff"
          opacity=".95"
        />
        <circle cx={cx + 12} cy={cy - 9} r="4" fill="#fff" opacity=".65" />
      </g>
      {solid && (
        <ellipse
          cx="157"
          cy="215"
          rx="6"
          ry="18"
          fill={red ? '#671629' : '#13171e'}
          transform="rotate(14 157 215)"
        />
      )}
    </svg>
  )
}
