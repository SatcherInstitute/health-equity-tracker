import { Link, useLocation } from 'react-router-dom'
import HetListItemButton from '../../styles/HetComponents/HetListItemButton'
import HetDivider from '../../styles/HetComponents/HetDivider'
import type { RouteConfig } from '../sharedTypes'
import {
  HEALTH_EQUITY_GUIDES_TAB,
  HEALTH_EQUITY_VIDEOS_TAB,
} from '../../utils/internalRoutes'
import GuidesTab from './GuidesTab'
import VideosTab from './LearningTab'

export const equityTabConfigs: RouteConfig[] = [
  {
    label: 'Data Visualization Guides',
    path: HEALTH_EQUITY_GUIDES_TAB,
    component: <GuidesTab />,
  },
  {
    label: 'Health Equity Deep Dive',
    path: HEALTH_EQUITY_VIDEOS_TAB,
    component: <VideosTab />,
  },
]

interface WIHECardMenuProps {
  className?: string
  routeConfigs: RouteConfig[]
  ariaLabel: string
}

export default function WIHECardMenu(props: WIHECardMenuProps) {
  const location = useLocation()

  return (
    <nav
      aria-label={props.ariaLabel}
      className={`rounded-sm mb-4 sm:my-0 md:py-0 tracking-normal shadow-raised-tighter min-w-64 md:max-w-aimToGo sm:w-3/5 md:mr-8 ${props.className ?? ''}`}
    >
      <div className='flex flex-row justify-center items-center md:flex-col '>
        {props.routeConfigs.map((config) => (
          <WIHECardMenuItem
            key={config.path}
            routeConfig={config}
            currentPath={location.pathname}
            className={` bg-white text-center w-auto ${props.className ?? ''}`}
          />
        ))}
      </div>
    </nav>
  )
}

interface WIHECardMenuItemProps {
  routeConfig: RouteConfig
  currentPath: string
  className?: string
}

function WIHECardMenuItem(props: WIHECardMenuItemProps) {
  const { routeConfig, currentPath } = props

  return (
    <>
      <Link className='no-underline w-full' to={routeConfig.path}>
        <HetListItemButton
          className='md:mx-auto text-center w-full px-1'
          selected={currentPath === routeConfig.path}
          aria-label={routeConfig.label}
          option='boldGreenRow'
        >
          {routeConfig.label}
        </HetListItemButton>
      </Link>
      <HetDivider />
    </>
  )
}
