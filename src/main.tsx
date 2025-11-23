import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import ChineseFlashcardApp from './components/ChineseFlashcards'
// import ChineseFlashcardApp from './components/ChineseFlashcard'

import ChineseFlashcardApp from './components/update/version3/ChineseFlashcard'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChineseFlashcardApp/>
  </StrictMode>,
)
