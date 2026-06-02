import { createBrowserRouter } from 'react-router-dom'

import InvitePage from './routes/InvitePage'
import LoginPage from './routes/LoginPage'
import NotFoundPage from './routes/NotFoundPage'
import ProjectListPage from './routes/ProjectListPage'
import SignupPage from './routes/SignupPage'
import WorkspacePage from './routes/WorkspacePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/',
    element: <ProjectListPage />,
  },
  {
    path: '/invite/:projectId',
    element: <InvitePage />,
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