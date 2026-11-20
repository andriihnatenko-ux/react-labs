import { produce } from 'immer'
import { defaultMilk } from '../data/menu.js'

/**
 * Чернетка нового замовлення — стан форми «Нове замовлення»:
 *   { customerName: 'Оля', items: [{ id, drink, size, milk, syrups }] }
 * customerName — текст поля «Ім'я гостя», items — додані напої.
 *
 * Порожня чернетка заморожена (Object.freeze), як і її масив items:
 * ред'юсер не може її змінити, лише повернути нову чернетку.
 */
export const emptyDraft = Object.freeze({
  customerName: '',
  items: Object.freeze([]),
})

/**
 * Ред'юсер форми «Нове замовлення». Отримує чернетку й дію, повертає нову
 * чернетку.
 *
 * Дії — що зробив бариста:
 *   { type: 'customer_changed', name }
 *       змінив текст поля «Ім'я гостя»
 *   { type: 'drink_added', id, drink }
 *       натиснув «+ Лате». Новий напій — розміру 'M', з молоком, типовим
 *       для нього в меню (defaultMilk у src/data/menu.js), без сиропів.
 *       id напою створює обробник події.
 *   { type: 'size_chosen', itemId, size }
 *       обрав розмір напою: 'S', 'M' чи 'L'
 *   { type: 'milk_chosen', itemId, milk }
 *       обрав молоко
 *   { type: 'syrup_toggled', itemId, syrup }
 *       відмітив сироп або зняв позначку
 *   { type: 'item_removed', itemId }
 *       натиснув «Видалити»
 *   { type: 'draft_cleared' }
 *       надіслав замовлення: форма знову порожня
 *
 * Невідома дія — помилка, у тексті якої є назва дії.
 *
 * Immer будує нову чернетку зі змін, які ред'юсер робить у draft, і копіює
 * лише змінений шлях. Вимоги — у тестах tests/draftReducer.test.js і
 * tests/OrderComposer.test.jsx.
 */
export const draftReducer = produce((draft, action) => {
  switch (action.type) {
    case 'customer_changed':
      draft.customerName = action.name
      break
    case 'drink_added':
      draft.items.push({
        id: action.id,
        drink: action.drink,
        size: 'M',
        milk: defaultMilk(action.drink),
        syrups: [],
      })
      break
    case 'size_chosen':
      itemById(draft, action.itemId).size = action.size
      break
    case 'milk_chosen':
      itemById(draft, action.itemId).milk = action.milk
      break
    case 'syrup_toggled': {
      const item = itemById(draft, action.itemId)
      const index = item.syrups.indexOf(action.syrup)
      if (index === -1) item.syrups.push(action.syrup)
      else item.syrups.splice(index, 1)
      break
    }
    case 'item_removed': {
      const index = draft.items.findIndex((item) => item.id === action.itemId)
      if (index !== -1) draft.items.splice(index, 1)
      break
    }
    case 'draft_cleared':
      draft.customerName = ''
      draft.items = []
      break
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
})

function itemById(draft, itemId) {
  return draft.items.find((item) => item.id === itemId)
}
