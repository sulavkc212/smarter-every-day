import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
import './index.css'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { DeckPage } from './pages/DeckPage'
import { Play, Review } from './pages/Play'
import { Settings } from './pages/Settings'

// Hash routing keeps the app working on any static host with no rewrite rules.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/deck/:deckId', element: <DeckPage /> },
      { path: '/play/:deckId', element: <Play /> },
      { path: '/review', element: <Review /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <Home /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
