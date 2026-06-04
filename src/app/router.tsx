import { createBrowserRouter } from 'react-router-dom'

import InvitePage from './routes/InvitePage'
import LoginPage from './routes/LoginPage'
import NotFoundPage from './routes/NotFoundPage'
import ProjectListPage from './routes/ProjectListPage'
import SignupPage from './routes/SignupPage'
import WorkspaceLayout from '@/features/workspace/components/WorkspaceLayout'

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
    element: <WorkspaceLayout />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])