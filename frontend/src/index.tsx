import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import GlobalStyles from '@mui/material/GlobalStyles'
import { StyledEngineProvider } from '@mui/material/styles'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5,
    },
  },
})

const container = document.getElementById('root')
if (container !== null) {
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StyledEngineProvider enableCssLayer>
          <GlobalStyles styles='@layer theme, base, mui, components, utilities;' />
          <App />
        </StyledEngineProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
