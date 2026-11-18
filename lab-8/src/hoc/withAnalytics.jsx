/**
 * Компонент вищого порядку (HOC): отримує компонент і повертає новий, який
 * рендерить `Component` з тими самими props, а під час кліку ще й надсилає
 * подію `event` в аналітику (`track` з src/analytics.js).
 *
 * Використання:
 *   const AddToCartButton = withAnalytics(Button, 'add_to_cart')
 *
 *   <AddToCartButton analyticsData={{ productId }} onClick={add}>
 *     Додати в кошик
 *   </AddToCartButton>
 *
 * `analyticsData` — проп самої обгортки: він іде в `track`, але не в DOM.
 * Решта props, зокрема `ref` (у React 19 це звичайний проп), доходять до
 * обгорнутого компонента.
 */
import { track } from '../analytics.js'

export function withAnalytics(Component, event) {
  function WithAnalytics({ analyticsData, ...props }) {
    const { onClick } = props

    return (
      <Component
        {...props}
        onClick={(clickEvent) => {
          track(event, analyticsData)
          onClick?.(clickEvent)
        }}
      />
    )
  }

  WithAnalytics.displayName = `withAnalytics(${Component.displayName ?? Component.name})`

  return WithAnalytics
}
