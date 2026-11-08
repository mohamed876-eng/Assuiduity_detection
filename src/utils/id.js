export function uid(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 9)
  return `${prefix}_${Date.now().toString(36)}${random}`
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
