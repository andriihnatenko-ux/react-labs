// data: доступ до сховища. Пакет не знає, хто його використовує, і не
// імпортує застосунок — лише браузерний localStorage.

const STORAGE_KEY = 'cart'

export function readCartJson() {
  return localStorage.getItem(STORAGE_KEY)
}

export function parseCartLines(json) {
  if (json === null) return []
  try {
    const value = JSON.parse(json)
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function writeCartLines(lines) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
}
