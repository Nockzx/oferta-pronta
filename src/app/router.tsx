import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { InicioPage } from '@/pages/InicioPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <InicioPage /> },
      { path: '/design-system', element: <DesignSystemPage /> },
    ],
  },
])
