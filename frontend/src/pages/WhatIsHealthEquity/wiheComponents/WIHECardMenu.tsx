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
      aria-pressed={props.isActiveTab}
      className={`font-sans-title text-title mx-2 cursor-pointer rounded rounded-sm px-8 py-4 text-center font-semibold no-underline ${props.isActiveTab ? 'bg-methodology-green text-alt-black shadow-raised cursor-auto border-0' : 'border-divider-gray bg-alt-white text-alt-green border'}`}
      type='button'
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
