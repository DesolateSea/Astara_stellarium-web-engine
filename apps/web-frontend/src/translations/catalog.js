// Ignore untranslated draft entries: empty strings must not suppress English fallback.
// Merge only JSON objects and strings, never metadata or prototype properties.
export function mergeCatalog (base = {}, additions = {}) {
  const result = Object.assign(Object.create(null), base)
  Object.keys(additions).forEach(key => {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) return
    const value = additions[key]
    if (typeof value === 'string' && value.trim()) result[key] = value
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeCatalog(result[key], value)
    }
  })
  return result
}
