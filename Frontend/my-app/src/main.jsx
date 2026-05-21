import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { store } from './app/store';
import { router } from './app/router';
import { registerAuthFailureHandler } from './shared/api/axiosClient';
import { clearAuth } from './modules/crm/auth/redux/authSlice';

registerAuthFailureHandler(() => {
  store.dispatch(clearAuth());
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
