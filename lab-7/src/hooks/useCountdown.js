import { useEffect, useState } from 'react'

/**
 * Зворотний відлік від `totalSeconds` до нуля, по секунді.
 *
 * Використання:
 *   const { secondsLeft, isRunning, start, pause, reset } = useCountdown(180)
 *
 * Вимоги — у тестах tests/useCountdown.test.jsx.
 */
export function useCountdown(totalSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)

  // Відлік активний, лише поки є що відраховувати. Коли час вийшов, це
  // значення стає false, ефект прибирає інтервал, а хуку не потрібен
  // окремий ефект, який синхронно зупиняв би таймер через setState.
  const isActive = isRunning && secondsLeft > 0

  useEffect(() => {
    if (!isActive) return undefined

    const id = setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => clearInterval(id)
  }, [isActive])

  function start() {
    setSecondsLeft((seconds) => (seconds === 0 ? totalSeconds : seconds))
    setIsRunning(true)
  }

  function pause() {
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
  }

  return { secondsLeft, isRunning: isActive, start, pause, reset }
}
