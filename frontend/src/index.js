import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from '@react-oauth/google';
import io from "socket.io-client";

import './index.css';
import App from './App';
import { setUpStorage } from "./redux/storage";
import { socketURL } from './configs/urls';

// 1. Ініціалізація Store та Google Client ID
const GOOGLE_CLIENT_ID = 
const storage = setUpStorage();

// 2. Створення контексту для Socket.io
export const AppContext = React.createContext();

// 3. Налаштування сокета з параметрами (наприклад, автопідключення)
const socket = io(socketURL, {
    transports: ['websocket'], // Рекомендується для стабільності відеочатів
    autoConnect: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // Provider Redux має бути найвищим
  <Provider store={storage}>
    <AppContext.Provider value={{ socket }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AppContext.Provider>
  </Provider>
);
