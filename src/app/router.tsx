import { createBrowserRouter } from 'react-router-dom'
import LoginPage from './routes/LoginPage'
import SignupPage from './routes/SignupPage'
import ProjectListPage from './routes/ProjectListPage'
import WorkspacePage from './routes/WorkspacePage'
import NotFoundPage from './routes/NotFoundPage'

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
    path: '/projects/:projectId',
    element: <WorkspacePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
