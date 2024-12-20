import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from'./App.jsx'
import './Componentes/api/api.css'
import './Componentes/nav/nav.css'

import Nav from './Componentes/nav/Nav.jsx'
import Api from './Componentes/api/api.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    

  
    
    

    <Nav />
    <Api />
  
    
  </StrictMode>,
)
