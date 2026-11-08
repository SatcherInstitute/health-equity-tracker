import { useLocation } from 'react-router'
import type { RouteConfig } from '../../pages/sharedTypes'
import HetDivider from './HetDivider'
import HetListItemButton from './HetListItemButton'

interface HetCardMenuProps {
  className?: string
  routeConfigs: RouteConfig[]
  ariaLabel: string
}

export default function HetCardMenu(props: HetCardMenuProps) {
  const location = useLocation()

  return (
    <nav
      aria-label={props.ariaLabel}
      className={`shadow-raised-tighter ml-0 flex flex-col rounded-sm py-0 pl-0 tracking-normal ${props.className ?? ''} `}
    >
      {props.routeConfigs.map((config) => (
        <HetDesktopMenuItem
          key={config.path}
          routeConfig={config}
          selected={location.pathname === config.path}
        />
      ))}
    </nav>
  )
}

interface HetDesktopMenuItemProps {
  routeConfig: RouteConfig
  selected: boolean
}

function HetDesktopMenuItem(props: HetDesktopMenuItemProps) {
  return (
    <>
      {props.routeConfig.isTopLevel && (
        <div className='m-0 p-0' aria-hidden>
          <HetDivider />
        </div>
      )}

      <HetListItemButton
        to={props.routeConfig.path}
        className='font-roboto mx-2 pl-2'
        selected={props.selected}
        ariaLabel={props.routeConfig.label}
        option={props.routeConfig.isTopLevel ? 'boldGreenCol' : 'normalBlack'}
      >
        {props.routeConfig.label}
      </HetListItemButton>
    </>
  )
}
