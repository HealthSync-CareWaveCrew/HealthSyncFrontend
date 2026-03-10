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
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getCurrentUser } from './Redux/Features/authSlice'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Google Client ID:', GOOGLE_CLIENT_ID);


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
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <StrictMode>
      <Provider store={store}>
        <AllRoutes />
      </Provider>
    </StrictMode>
  </GoogleOAuthProvider>
);