// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { Provider } from 'react-redux'
// import { store } from './Redux/Store/store'
// import './index.css'
// import AllRoutes from './routes/AllRoutes'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Provider store={store}>
//       <AllRoutes />
//     </Provider>
//   </StrictMode>,
// )

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, useDispatch } from 'react-redux'
import { store } from './Redux/Store/store'
import './index.css'
import AllRoutes from './routes/AllRoutes'
import { getCurrentUser } from './Redux/Features/authSlice'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return <AllRoutes />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AppInitializer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
      />
    </Provider>
  </StrictMode>
);