import React from 'react';
import {createRoot} from 'react-dom/client';
import Testimonials from './Testimonials.jsx';
const root=document.getElementById('battleship-testimonials');
if(root)createRoot(root).render(<Testimonials compact/>);
