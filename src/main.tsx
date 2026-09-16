import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import ChineseFlashcardApp from './components/update/version4/ChineseFlashcard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChineseFlashcardApp/>
  </StrictMode>,
)
