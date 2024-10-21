import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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

export default function WIHECardMenu() {
  const location = useLocation()

  useEffect(() => {
    const section = document.getElementById('learning-section')
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }, [location.pathname])

  return (
    <div className='w-full'>
      <nav className='flex justify-center mb-4'>
        {wiheConfigs.map((config, index) => (
          <Link
            key={index}
            to={config.path}
            className={`py-4 px-8 mx-2 rounded text-center font-sansTitle text-title font-semibold no-underline rounded-sm ${
              location.pathname.includes(config.path)
                ? 'bg-methodologyGreen text-altBlack shadow-raised'
                : 'bg-white text-altGreen border border-altBlack'
            }`}
          >
            {config.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
