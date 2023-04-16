import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import './styles/index.scss'
import App from './App'
import 'typeface-hind'
import 'typeface-montserrat'
import { QueryClient, QueryClientProvider } from 'react-query'
import { persistQueryClient } from 'react-query/persistQueryClient-experimental'
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://33c166fcaeaa40abbc398c9df5f76c1c@o4505014650863616.ingest.sentry.io/4505014690381824',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 0.2, // Capture rate (out of 1) of all transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  environment: import.meta.env.MODE,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5,
    },
  },
})

/*
VERY IMPORTANT: This utility is currently in an experimental stage. This means that breaking changes will happen in minor AND patch releases. Use at your own risk. If you choose to rely on this in production in an experimental stage, please lock your version to a patch-level version to avoid unexpected breakages.
 */
const localStoragePersistor = createWebStoragePersistor({
  storage: window.localStorage,
})
void persistQueryClient({
  queryClient,
  persistor: localStoragePersistor,
})

ReactDOM.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
  document.getElementById('root')
)
