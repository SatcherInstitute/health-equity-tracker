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
    <nav className='mb-4 flex justify-center'>
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
      className={`mx-2 cursor-pointer rounded rounded-sm px-8 py-4 text-center font-sansTitle font-semibold text-title no-underline ${props.isActiveTab ? 'cursor-auto border-0 bg-methodologyGreen text-altBlack shadow-raised' : 'border border-dividerGrey bg-white text-altGreen'}`}
      type='button'
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
