import { AppHeader } from '../widgets/app-header/index.js'
import { NotFound } from '../shared/ui/index.js'
import { useRoute } from './useRoute.js'
import { BeanPage } from '../pages/bean/index.js'
import { CartPage } from '../pages/cart/index.js'
import { CatalogPage } from '../pages/catalog/index.js'

function renderPage(route) {
  switch (route.name) {
    case 'catalog':
      return <CatalogPage />
    case 'bean':
      return <BeanPage key={route.id} beanId={route.id} />
    case 'cart':
      return <CartPage />
    default:
      return <NotFound />
  }
}

export default function App() {
  const route = useRoute()

  return (
    <>
      <AppHeader />
      <main className="app">{renderPage(route)}</main>
    </>
  )
}
