import React from 'react';
import {createRoot} from 'react-dom/client';
import CorporatePage from './CorporatePage.jsx';
import './style.css';
import './corporate.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><CorporatePage /></React.StrictMode>
);
