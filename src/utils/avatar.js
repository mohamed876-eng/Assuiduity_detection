const PALETTES = [
  ['#e9e9ec', '#343338'],
  ['#dedee2', '#29282d'],
  ['#d3d2d8', '#3f3e44'],
  ['#f3f3f5', '#57565b'],
  ['#e5e5e8', '#101014'],
  ['#d9d9dd', '#57565b'],
  ['#ebebed', '#343338'],
  ['#cfcfd4', '#1f1e22'],
]

export function avatarPalette(seed = '') {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 997
  }
  return PALETTES[hash % PALETTES.length]
}

export function generateAvatarDataUrl(name = '', seed = '') {
  const palette = avatarPalette(seed || name)
  const label = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <rect width="160" height="160" rx="80" fill="${palette[0]}"/>
    <text x="80" y="80" fill="${palette[1]}" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="600" text-anchor="middle" dominant-baseline="central">${label}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
