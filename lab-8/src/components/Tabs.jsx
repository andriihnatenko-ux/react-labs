/**
 * Вкладки — складений компонент (compound component): `Tabs` і його частини
 * `Tabs.List`, `Tabs.Tab` і `Tabs.Panel`. Вміст кожної частини приходить між
 * її тегами як `children`, а яка вкладка обрана, частини дізнаються з
 * контексту, який створює `Tabs`.
 *
 * Використання:
 *   <Tabs defaultValue="brew">
 *     <Tabs.List aria-label="Про каву">
 *       <Tabs.Tab value="brew">Заварювання</Tabs.Tab>
 *       <Tabs.Tab value="reviews">Відгуки</Tabs.Tab>
 *     </Tabs.List>
 *     <Tabs.Panel value="brew">…</Tabs.Panel>
 *     <Tabs.Panel value="reviews">…</Tabs.Panel>
 *   </Tabs>
 *
 * Вимоги — у тестах tests/Tabs.children.test.jsx і tests/Tabs.a11y.test.jsx.
 */
import { createContext, use, useId, useMemo, useState } from 'react'

const TabsContext = createContext(null)

function useTabsContext(componentName) {
  const context = use(TabsContext)
  if (context === null) {
    throw new Error(`${componentName} must be rendered inside <Tabs>`)
  }
  return context
}

function List({ children, ...props }) {
  return (
    <div role="tablist" className="tab-list" {...props}>
      {children}
    </div>
  )
}

const NAVIGATION_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

function Tab({ value, children, onClick, onKeyDown, ...props }) {
  const { selectedValue, select, tabId, panelId } = useTabsContext('Tabs.Tab')
  const isSelected = selectedValue === value

  function handleKeyDown(event) {
    if (!NAVIGATION_KEYS.includes(event.key)) return
    // Home і End зазвичай прокручують сторінку — тут вони лише обирають вкладку.
    event.preventDefault()
    const tabs = Array.from(
      event.currentTarget.parentElement.querySelectorAll('[role="tab"]'),
    )
    const index = tabs.indexOf(event.currentTarget)
    if (index === -1 || tabs.length === 0) return
    let nextIndex
    if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    } else if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    }
    const nextTab = tabs[nextIndex]
    nextTab.focus()
    // Клік обирає вкладку через її власний обробник: автоматична активація.
    nextTab.click()
  }

  return (
    <button
      type="button"
      role="tab"
      id={tabId(value)}
      aria-selected={isSelected}
      aria-controls={panelId(value)}
      tabIndex={isSelected ? 0 : -1}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        select(value)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        handleKeyDown(event)
      }}
    >
      {children}
    </button>
  )
}

function Panel({ value, children, ...props }) {
  const { selectedValue, tabId, panelId } = useTabsContext('Tabs.Panel')
  const isSelected = selectedValue === value

  return (
    <div
      role="tabpanel"
      id={panelId(value)}
      aria-labelledby={tabId(value)}
      tabIndex={0}
      hidden={!isSelected}
      {...props}
    >
      {children}
    </div>
  )
}

export default function Tabs({ defaultValue, children }) {
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const idPrefix = useId()
  const contextValue = useMemo(
    () => ({
      selectedValue,
      select: setSelectedValue,
      tabId: (value) => `${idPrefix}-tab-${value}`,
      panelId: (value) => `${idPrefix}-panel-${value}`,
    }),
    [selectedValue, idPrefix],
  )

  return (
    <TabsContext value={contextValue}>
      <div className="tabs">{children}</div>
    </TabsContext>
  )
}

Tabs.List = List
Tabs.Tab = Tab
Tabs.Panel = Panel
