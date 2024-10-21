import { Link } from 'react-router-dom'
import GuidesTab from '../wiheSections/GuidesTab'
import ExternalResourcesTab from '../wiheSections/ExternalResourcesTab'

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
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        className={`py-4 px-8 mx-2 rounded text-center font-sansTitle text-title font-semibold no-underline rounded-sm ${activeTab === 'guides' ? 'bg-methodologyGreen text-altBlack shadow-raised' : 'bg-white text-altGreen border border-altBlack'}`}
        onClick={() => onTabChange('guides')}
      >
        Data Visualization Guides
      </button>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        className={`py-4 px-8 mx-2 rounded text-center font-sansTitle text-title font-semibold no-underline rounded-sm ${activeTab === 'resources' ? 'bg-methodologyGreen text-altBlack shadow-raised' : 'bg-white text-altGreen border border-altBlack'}`}
        onClick={() => onTabChange('resources')}
      >
        Health Equity Deep Dive
      </button>
    </nav>
  )
}
