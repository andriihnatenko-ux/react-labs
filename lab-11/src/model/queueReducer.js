/**
 * Ред'юсер черги замовлень. Його написав колега; у нього черга працює.
 *
 * Стан: { orders: [...] }. Кожне замовлення — як у src/data/orders.js:
 *   { id, number, status, customer: { id, name }, items: [...] }
 * status — колонка на дошці: 'new' («Нові»), 'brewing' («Готуються»),
 * 'ready' («Готові») або 'served' («Видані»).
 *
 * Дії — події на сторінці:
 *   { type: 'order_placed', order: { id, customer: { id, name }, items } }
 *       бариста надіслав нове замовлення з форми. Номер і статус 'new'
 *       дає ред'юсер, кожен напій отримує done: false. id замовлення й
 *       гостя створює обробник події.
 *   { type: 'item_toggled', orderId, itemId }
 *       бариста відмітив напій готовим або зняв позначку
 *   { type: 'order_advanced', orderId }
 *       бариста натиснув «Почати», «Готово» чи «Видати»: замовлення
 *       переходить у наступну колонку
 *   { type: 'order_cancelled', orderId }
 *       бариста натиснув «Скасувати замовлення»
 *   { type: 'customer_renamed', customerId, name }
 *       бариста виправив ім'я гостя в «Деталях»
 *
 * Компоненти й тести читають стан лише через selectColumn і selectOrder
 * унизу файлу.
 */

const nextStatus = { new: 'brewing', brewing: 'ready', ready: 'served' }

/** Початковий стан черги з вкладених замовлень, як їх повертає loadOrders(). */
export function createInitialState(orders) {
  return {
    orders,
    // Номери лише ростуть, а номер скасованого замовлення новому не
    // дістається, тому останній номер живе в стані, а не в модулі.
    lastNumber: Math.max(...orders.map((order) => order.number)),
  }
}

export function queueReducer(state, action) {
  switch (action.type) {
    case 'order_placed': {
      const number = state.lastNumber + 1
      const order = {
        ...action.order,
        number,
        status: 'new',
        items: action.order.items.map((item) => ({ ...item, done: false })),
      }
      return { ...state, lastNumber: number, orders: [...state.orders, order] }
    }
    case 'item_toggled': {
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.id === action.itemId
                    ? { ...item, done: !item.done }
                    : item,
                ),
              }
            : order,
        ),
      }
    }
    case 'order_advanced': {
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId
            ? { ...order, status: nextStatus[order.status] }
            : order,
        ),
      }
    }
    case 'order_cancelled': {
      return {
        ...state,
        orders: state.orders.filter((order) => order.id !== action.orderId),
      }
    }
    case 'customer_renamed': {
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.customer.id === action.customerId
            ? { ...order, customer: { ...order.customer, name: action.name } }
            : order,
        ),
      }
    }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

/**
 * Замовлення однієї колонки (status) у порядку надходження, кожне разом із
 * гостем і напоями.
 */
export function selectColumn(state, status) {
  return state.orders.filter((order) => order.status === status)
}

/** Замовлення за id разом із гостем і напоями; undefined, якщо його немає. */
export function selectOrder(state, id) {
  return state.orders.find((order) => order.id === id)
}
