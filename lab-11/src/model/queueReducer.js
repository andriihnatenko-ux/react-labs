/**
 * Ред'юсер черги замовлень.
 *
 * Стан нормалізований: кожен об'єкт зберігається один раз, а замовлення
 * посилається на гостя через customerId.
 *   {
 *     orders: { byId: { o41: { id, number, status, customerId, items }, … },
 *               ids: ['o41', …] },
 *     customers: { byId: { c1: { id, name }, … }, ids: ['c1', …] },
 *     lastNumber,
 *   }
 * ids зберігає порядок надходження. status — колонка на дошці: 'new'
 * («Нові»), 'brewing' («Готуються»), 'ready' («Готові») або 'served'
 * («Видані»). Напої лишаються всередині замовлення.
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
  const ordersById = {}
  const orderIds = []
  const customersById = {}
  const customerIds = []
  let lastNumber = 0

  for (const { customer, ...order } of orders) {
    ordersById[order.id] = { ...order, customerId: customer.id }
    orderIds.push(order.id)

    if (!customersById[customer.id]) {
      customersById[customer.id] = { ...customer }
      customerIds.push(customer.id)
    }

    // Номери лише ростуть, а номер скасованого замовлення новому не
    // дістається, тому останній номер живе в стані, а не в модулі.
    lastNumber = Math.max(lastNumber, order.number)
  }

  return {
    orders: { byId: ordersById, ids: orderIds },
    customers: { byId: customersById, ids: customerIds },
    lastNumber,
  }
}

export function queueReducer(state, action) {
  switch (action.type) {
    case 'order_placed': {
      const { order } = action
      const number = state.lastNumber + 1
      const customer = order.customer
      const customerExists = Boolean(state.customers.byId[customer.id])

      return {
        ...state,
        lastNumber: number,
        orders: {
          byId: {
            ...state.orders.byId,
            [order.id]: {
              id: order.id,
              number,
              status: 'new',
              customerId: customer.id,
              items: order.items.map((item) => ({ ...item, done: false })),
            },
          },
          ids: [...state.orders.ids, order.id],
        },
        customers: customerExists
          ? state.customers
          : {
              byId: {
                ...state.customers.byId,
                [customer.id]: { ...customer },
              },
              ids: [...state.customers.ids, customer.id],
            },
      }
    }
    case 'item_toggled': {
      const order = state.orders.byId[action.orderId]
      return {
        ...state,
        orders: {
          ...state.orders,
          byId: {
            ...state.orders.byId,
            [action.orderId]: {
              ...order,
              items: order.items.map((item) =>
                item.id === action.itemId
                  ? { ...item, done: !item.done }
                  : item,
              ),
            },
          },
        },
      }
    }
    case 'order_advanced': {
      const order = state.orders.byId[action.orderId]
      return {
        ...state,
        orders: {
          ...state.orders,
          byId: {
            ...state.orders.byId,
            [action.orderId]: {
              ...order,
              status: nextStatus[order.status],
            },
          },
        },
      }
    }
    case 'order_cancelled': {
      const byId = { ...state.orders.byId }
      delete byId[action.orderId]
      return {
        ...state,
        orders: {
          byId,
          ids: state.orders.ids.filter((id) => id !== action.orderId),
        },
      }
    }
    case 'customer_renamed': {
      const customer = state.customers.byId[action.customerId]
      return {
        ...state,
        customers: {
          ...state.customers,
          byId: {
            ...state.customers.byId,
            [action.customerId]: { ...customer, name: action.name },
          },
        },
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
  return state.orders.ids
    .map((id) => state.orders.byId[id])
    .filter((order) => order.status === status)
    .map((order) => withCustomer(state, order))
}

/** Замовлення за id разом із гостем і напоями; undefined, якщо його немає. */
export function selectOrder(state, id) {
  const order = state.orders.byId[id]
  return order ? withCustomer(state, order) : undefined
}

function withCustomer(state, order) {
  return { ...order, customer: state.customers.byId[order.customerId] }
}
