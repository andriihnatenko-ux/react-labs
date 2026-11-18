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
import { createContext, use, useMemo, useState } from 'react'

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
    <div className="tab-list" {...props}>
      {children}
    </div>
  )
}

function Tab({ value, children, onClick, ...props }) {
  const { selectedValue, select } = useTabsContext('Tabs.Tab')
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      className={isSelected ? 'active' : ''}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        select(value)
      }}
    >
      {children}
    </button>
  )
}

function Panel({ value, children, ...props }) {
  const { selectedValue } = useTabsContext('Tabs.Panel')
  const isSelected = selectedValue === value

  return (
    <div hidden={!isSelected} {...props}>
      {children}
    </div>
  )
}

export default function Tabs({ defaultValue, children }) {
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const contextValue = useMemo(
    () => ({ selectedValue, select: setSelectedValue }),
    [selectedValue],
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
