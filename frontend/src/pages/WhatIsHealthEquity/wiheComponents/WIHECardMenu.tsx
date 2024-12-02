import ExternalResourcesTab from '../wiheSections/ExternalResourcesTab'
import GuidesTab from '../wiheSections/GuidesTab'

export const wiheConfigs = [
  {
    label: 'Data Visualization Guides',
    path: '/whatishealthequity/guides',
    component: <GuidesTab />,
  },
  {
    label: 'Health Equity Deep Dive',
    path: '/whatishealthequity/external-resources',
    component: <ExternalResourcesTab />,
  },
]

interface WIHECardMenuProps {
  activeTab: 'guides' | 'resources'
  onTabChange: (tab: 'guides' | 'resources') => void
}
export default function WIHECardMenu({
  activeTab,
  onTabChange,
}: WIHECardMenuProps) {
  return (
    <nav className='flex justify-center mb-4'>
      <HetTabButton
        isActiveTab={activeTab === 'guides'}
        onClick={() => onTabChange('guides')}
      >
        Data Visualization Guides
      </HetTabButton>

      <HetTabButton
        isActiveTab={activeTab === 'resources'}
        onClick={() => onTabChange('resources')}
      >
        Health Equity Deep Dive
      </HetTabButton>
    </nav>
  )
}

interface HetTabButtonProps {
  children: React.ReactNode
  onClick: () => void
  isActiveTab: boolean
}

function HetTabButton(props: HetTabButtonProps) {
  return (
    <button
      className={`cursor-pointer py-4 px-8 mx-2 rounded text-center font-sansTitle text-title font-semibold no-underline rounded-sm ${props.isActiveTab ? 'bg-methodologyGreen text-altBlack shadow-raised border-0 cursor-auto' : 'bg-white text-altGreen border border-dividerGrey'}`}
      type='button'
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
