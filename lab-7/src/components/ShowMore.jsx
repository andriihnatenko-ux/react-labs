import { useState } from 'react'

/**
 * Показує перші `step` елементів з `items` і кнопку, що показує наступні.
 *
 * Використання:
 *   <ShowMore items={reviews} step={3}>
 *     {(visibleItems) => <ul>…</ul>}
 *   </ShowMore>
 *
 * Вимоги — у тестах tests/ShowMore.test.jsx.
 */
export default function ShowMore({ items, step, children }) {
  const [count, setCount] = useState(step)
  const visibleItems = items.slice(0, count)
  const hiddenCount = items.length - visibleItems.length
  const expanded = hiddenCount === 0

  return (
    <>
      {children(visibleItems)}
      {items.length > step && (
        <button
          type="button"
          className="show-more"
          onClick={() => setCount(expanded ? step : count + step)}
        >
          {expanded ? 'Згорнути' : `Показати ще ${Math.min(step, hiddenCount)}`}
        </button>
      )}
    </>
  )
}
