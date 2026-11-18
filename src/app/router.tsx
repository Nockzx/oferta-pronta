import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { InicioPage } from '@/pages/InicioPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'
import { MarcaPage } from '@/pages/MarcaPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <InicioPage /> },
      { path: '/marca', element: <MarcaPage /> },
      { path: '/design-system', element: <DesignSystemPage /> },
    ],
  },
])
