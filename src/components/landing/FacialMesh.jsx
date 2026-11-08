const POINTS = [
  [50, 9],
  [37, 13],
  [63, 13],
  [27, 22],
  [73, 22],
  [18, 34],
  [82, 34],
  [14, 48],
  [86, 48],
  [18, 62],
  [82, 62],
  [27, 74],
  [73, 74],
  [39, 84],
  [61, 84],
  [50, 91],
  [38, 30],
  [62, 30],
  [50, 39],
  [39, 50],
  [61, 50],
  [50, 60],
  [36, 38],
  [64, 38],
  [33, 57],
  [67, 57],
  [44, 68],
  [56, 68],
  [50, 75],
  [45, 46],
  [55, 46],
  [50, 52],
  [30, 47],
  [70, 47],
  [23, 55],
  [77, 55],
  [30, 66],
  [70, 66],
  [40, 79],
  [60, 79],
  [50, 84],
]

const EDGES = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8],
  [7, 9], [8, 10], [9, 11], [10, 12], [11, 13], [12, 14], [13, 15],
  [14, 15], [0, 16], [0, 17], [16, 18], [17, 18], [16, 19], [17, 20],
  [19, 20], [19, 21], [20, 21], [3, 16], [4, 17], [5, 19], [6, 20],
  [7, 19], [8, 20], [9, 21], [10, 21], [11, 21], [12, 21], [13, 21],
  [16, 22], [17, 23], [18, 22], [18, 23], [19, 24], [20, 25], [22, 24],
  [23, 25], [24, 26], [25, 27], [26, 27], [26, 28], [27, 28], [18, 29],
  [18, 30], [29, 31], [30, 31], [19, 32], [20, 33], [7, 34], [8, 35],
  [11, 36], [12, 37], [13, 38], [14, 39], [15, 40], [38, 40], [39, 40],
  [26, 39], [27, 38], [21, 28], [24, 31], [25, 31], [29, 24], [30, 25],
]

export function FacialMesh({ className, tone = 'dark', opacity = 1 }) {
  const stroke = tone === 'dark' ? '#ffffff' : '#343338'
  const node = tone === 'dark' ? '#f3f3f5' : '#101014'

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <g stroke={stroke} strokeWidth="0.22" strokeOpacity="0.42">
        {EDGES.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            x1={POINTS[from][0]}
            y1={POINTS[from][1]}
            x2={POINTS[to][0]}
            y2={POINTS[to][1]}
          />
        ))}
      </g>
      <g fill={node}>
        {POINTS.map(([x, y], index) => (
          <circle key={`${x}-${y}-${index}`} cx={x} cy={y} r={index % 4 === 0 ? 0.62 : 0.38} fillOpacity={index % 4 === 0 ? 0.9 : 0.58} />
        ))}
      </g>
      <circle cx="50" cy="50" r="39" stroke={stroke} strokeOpacity="0.18" strokeWidth="0.25" strokeDasharray="1 2" />
      <circle cx="50" cy="50" r="45" stroke={stroke} strokeOpacity="0.1" strokeWidth="0.22" />
      <path d="M50 3v7M50 90v7M3 50h7M90 50h7" stroke={stroke} strokeOpacity="0.35" strokeWidth="0.35" />
      <rect x="31" y="20" width="38" height="61" rx="17" stroke={stroke} strokeOpacity="0.22" strokeWidth="0.3" strokeDasharray="1.5 2.4" />
    </svg>
  )
}
