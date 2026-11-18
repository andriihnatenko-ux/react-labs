// state: рядки кошика { id, name, price, quantity }. Назву й ціну рядок
// запам'ятовує в момент додавання. Компоненти читають кошик через хук
// useCart, а він — через subscribe і getLines.

import {
  parseCartLines,
  readCartJson,
  writeCartLines,
} from '../data/cartStorage.js'

const listeners = new Set()
let storedJson = null
let lines = []

// Читає localStorage під час кожного виклику, але повертає той самий масив,
// поки збережений рядок не змінився: useSyncExternalStore вимагає саме
// цього, інакше компонент рендерився б без кінця.
export function getLines() {
  const json = readCartJson()
  if (json !== storedJson) {
    storedJson = json
    lines = parseCartLines(json)
  }
  return lines
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function save(nextLines) {
  writeCartLines(nextLines)
  listeners.forEach((listener) => listener())
}

export function addItem(bean) {
  const current = getLines()
  if (current.some((line) => line.id === bean.id)) {
    save(
      current.map((line) =>
        line.id === bean.id ? { ...line, quantity: line.quantity + 1 } : line,
      ),
    )
  } else {
    const { id, name, price } = bean
    save([...current, { id, name, price, quantity: 1 }])
  }
}

export function setQuantity(id, quantity) {
  if (quantity < 1) return
  save(
    getLines().map((line) => (line.id === id ? { ...line, quantity } : line)),
  )
}

export function removeItem(id) {
  save(getLines().filter((line) => line.id !== id))
}
