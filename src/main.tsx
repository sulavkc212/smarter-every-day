import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router'
import './index.css'
import { Layout } from './components/Layout'
import { Today } from './pages/Today'
import { Explore } from './pages/Explore'
import { ReviewPage } from './pages/ReviewPage'
import { Me } from './pages/Me'
import { DeckPage } from './pages/DeckPage'
import { Daily, Play, Review } from './pages/Play'

// Hash routing keeps the app working on any static host with no rewrite rules.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Today /> },
      { path: '/explore', element: <Explore /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/me', element: <Me /> },
      { path: '/deck/:deckId', element: <DeckPage /> },
      { path: '/play/daily', element: <Daily /> },
      { path: '/play/:deckId', element: <Play /> },
      { path: '/review/play', element: <Review /> },
      { path: '/settings', element: <Navigate to="/me" replace /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
