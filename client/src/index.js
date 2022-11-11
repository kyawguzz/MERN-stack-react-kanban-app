import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './redux/store';
import { Provider} from 'react-redux'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <ToastContainer
            position="bottom-right"
            autoClose={2000}        
            closeOnClick
            pauseOnHover={false}
            theme="dark"
         />
      <App />
    </Provider>
    
  // </React.StrictMode>
);


