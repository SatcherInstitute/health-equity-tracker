import { Link } from 'react-router'
import type { RouteConfig } from '../../pages/sharedTypes'
import HetDivider from './HetDivider'
import HetListItemButton from './HetListItemButton'

interface HetCardMenuProps {
  className?: string
  routeConfigs: RouteConfig[]
  ariaLabel: string
}

export default function HetCardMenu(props: HetCardMenuProps) {
  return (
    <nav
      role='menu'
      aria-label={props.ariaLabel}
      className={`ml-0 flex flex-col rounded-sm py-0 pl-0 tracking-normal shadow-raised-tighter ${props.className ?? ''} `}
    >
      {props.routeConfigs.map((config) => (
        <HetDesktopMenuItem key={config.path} routeConfig={config} />
      ))}
    </nav>
  )
}

interface HetDesktopMenuItemProps {
  routeConfig: RouteConfig
}

function HetDesktopMenuItem(props: HetDesktopMenuItemProps) {
  return (
    <>
      {props.routeConfig.isTopLevel && (
        <li className='m-0 list-none p-0' aria-hidden>
          <HetDivider />
        </li>
      )}

      <HetListItemButton
        className='mx-2 pl-2 font-roboto'
        selected={window.location.pathname === props.routeConfig.path}
        aria-label={props.routeConfig.label}
        option={props.routeConfig.isTopLevel ? 'boldGreenCol' : 'normalBlack'}
      >
        <Link className='no-underline' to={props.routeConfig.path}>
          {props.routeConfig.label}
        </Link>
      </HetListItemButton>
    </>
  )
}
