import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './Redux/Store/store'
import './index.css'
import AllRoutes from './routes/AllRoutes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AllRoutes />
    </Provider>
  </StrictMode>,
)
