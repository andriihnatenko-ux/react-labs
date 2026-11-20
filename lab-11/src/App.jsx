import { useReducer, useState } from 'react'
import HistoryButtons from './components/HistoryButtons.jsx'
import OrderBoard from './components/OrderBoard.jsx'
import OrderComposer from './components/OrderComposer.jsx'
import OrderDetails from './components/OrderDetails.jsx'
import { loadOrders } from './data/orders.js'
import {
  createInitialState,
  queueReducer,
  selectOrder,
} from './model/queueReducer.js'
import { createHistory, withUndo } from './model/withUndo.js'

// withUndo створюємо один раз на модуль, а не на кожен рендер: інакше React
// щоразу отримував би нову функцію-ред'юсер.
const undoableQueueReducer = withUndo(queueReducer)

export default function App() {
  const [history, dispatch] = useReducer(undoableQueueReducer, null, () =>
    createHistory(createInitialState(loadOrders())),
  )
  const queue = history.present
  // id замовлення, відкритого в «Деталях», або null.
  const [openedOrderId, setOpenedOrderId] = useState(null)
  const openedOrder = openedOrderId
    ? selectOrder(queue, openedOrderId)
    : undefined

  function handlePlace({ customerName, items }) {
    dispatch({
      type: 'order_placed',
      order: {
        id: crypto.randomUUID(),
        customer: { id: crypto.randomUUID(), name: customerName },
        items,
      },
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Черга замовлень</h1>
        <p className="lead">
          Нове замовлення приймають у формі, а далі воно йде колонками зліва
          направо.
        </p>
      </header>
      <div className="workspace">
        <OrderComposer onPlace={handlePlace} />
        <main className="queue">
          <OrderDetails
            order={openedOrder}
            dispatch={dispatch}
            onClose={() => setOpenedOrderId(null)}
          />
          <HistoryButtons
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            onUndo={() => dispatch({ type: 'undo' })}
            onRedo={() => dispatch({ type: 'redo' })}
          />
          <OrderBoard
            queue={queue}
            dispatch={dispatch}
            onOpen={(order) => setOpenedOrderId(order.id)}
          />
        </main>
      </div>
    </div>
  )
}
