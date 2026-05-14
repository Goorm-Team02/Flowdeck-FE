// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom'

import NotFoundPage from './routes/NotFoundPage'
import ProjectListPage from './routes/ProjectListPage'
import WorkspacePage from './routes/WorkspacePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProjectListPage />,
  },
  {
    path: '/projects/:projectId',
    element: <WorkspacePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
