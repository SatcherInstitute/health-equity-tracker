import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { HetOverline } from '../../styles/HetComponents/HetOverline'
import { HetTermRaised } from '../../styles/HetComponents/HetTermRaised'
import { useScrollToAnchor } from '../../utils/hooks/useScrollToAnchor'
import WIHECardMenu from './wiheComponents/WIHECardMenu'
import ExternalResourcesTab from './wiheSections/ExternalResourcesTab'
import FaqSection from './wiheSections/FaqSection'
import GuidesTab from './wiheSections/GuidesTab'

export default function WhatIsHealthEquityPage() {
  const location = useLocation()
  const scrollToAnchor = useScrollToAnchor()
  const [activeTab, setActiveTab] = useState<'guides' | 'resources'>('guides')

  const handleTabChange = (tab: 'guides' | 'resources') => {
    setActiveTab(tab)
  }
  useEffect(() => {
    scrollToAnchor('main-content', 0)
  }, [location.pathname, scrollToAnchor])

  useEffect(() => {
    const section = document.getElementById('learning-section')
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
    }
  }, [location.pathname])

  return (
    <>
      <title>What is Health Equity? - Health Equity Tracker</title>

      <section
        id='main-content'
        aria-labelledby='main-content'
        tabIndex={-1}
        className='mx-auto flex w-svw max-w-lgplus flex-col justify-center px-8 py-16'
      >
        <h1
          id='main'
          className='font-bold font-sans-title text-alt-green text-big-header leading-normal '
        >
          What is Health Equity?
        </h1>

        <div className='my-4 xs:block flex grow items-center text-left smplus:flex-col'>
          <HetTermRaised
            term={'Health equity'}
            termType={'noun'}
            emphasizedText={
              'have fair and just access, opportunity, and resources'
            }
            emphasizedTextPosition={'middle'}
            description={`exists when all people, regardless of race, sex, sexual orientation, disability, socio-economic status, geographic location, or other societal constructs have fair and just access, opportunity, and resources to achieve their highest potential for health.`}
            source={'Health Equity Leadership & Exchange Network, 2020'}
          />
          <p className='p-4 text-left text-title md:text-center'>
            Unfortunately, social and political determinants of health
            negatively affect many communities, their people, and their ability
            to lead healthy lives.
          </p>
          <div className='flex flex-col justify-evenly gap-4 text-left md:flex-row'>
            <HetTermRaised
              className='xs:w-full md:w-1/2'
              term={'Political determinants of health'}
              termType={'noun'}
              emphasizedText={
                'structuring relationships, distributing resources, and administering power.'
              }
              emphasizedTextPosition={'middle'}
              description={`involve the systematic process of structuring relationships, distributing resources, and administering power. These processes operate simultaneously, mutually reinforcing or influencing one another to shape opportunities that either advance health equity or exacerbate health inequities.`}
              source={'Daniel Dawes, 2020'}
            />
            <HetTermRaised
              className='xs:w-full md:w-1/2'
              term={'Social determinants of health'}
              termType={'noun'}
              emphasizedText={'conditions in the environments'}
              emphasizedTextPosition={'middle'}
              description={`The conditions in the environments in which people are born, live, work, play, worship, and age that affect a wide range of health, functioning, and quality-of-life outcomes and risks.`}
              source={'Healthy People 2020, CDC'}
            />
          </div>
        </div>
      </section>
      <section
        aria-labelledby='learning-section'
        id='learning-section'
        className='bg-white-smoke80'
      >
        <div className='mx-auto flex w-svw max-w-lgplus flex-col justify-center p-8'>
          <div className='mx-auto flex w-full max-w-lgplus flex-col justify-center'>
            <HetOverline text={'Trending Topics'} className='text-center' />
            <h2 className='m-0 pb-5 text-center font-bold font-sans-title text-alt-green text-header leading-modal-heading'>
              Don't know where to start?
            </h2>
            <p className='my-4 text-center text-title'>
              Discover how the Health Equity Tracker can be your tool to drive
              change and advance health equity in your community.
            </p>
          </div>
          <div className='flex flex-col items-center justify-center text-left md:justify-between'>
            <WIHECardMenu activeTab={activeTab} onTabChange={handleTabChange} />
            <article className='flex w-full flex-col justify-center'>
              {activeTab === 'guides' ? (
                <GuidesTab />
              ) : (
                <ExternalResourcesTab />
              )}
            </article>
          </div>
        </div>
      </section>

      <section
        aria-labelledby='select-faqs'
        className='mx-auto flex w-svw max-w-lgplus items-center justify-center px-8 py-16 xl:px-0'
      >
        <FaqSection />
      </section>
    </>
  )
}
