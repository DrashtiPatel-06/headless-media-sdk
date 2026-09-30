import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsPage from './DocsPage'
import './index.css'
import App from './App.tsx'

const path = window.location.pathname.replace(/\/$/, '') || '/'
const docsPage = path === '/docs/sdk'
  ? 'sdk'
  : path === '/docs/components'
    ? 'components'
    : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {docsPage ? <DocsPage page={docsPage} /> : <App />}
  </StrictMode>,
)
