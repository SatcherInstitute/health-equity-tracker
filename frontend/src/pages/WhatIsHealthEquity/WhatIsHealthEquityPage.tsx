import { useState } from 'react'
import { HetOverline } from '../../styles/HetComponents/HetOverline'
import { HetTermRaised } from '../../styles/HetComponents/HetTermRaised'
import WIHECardMenu from './wiheComponents/WIHECardMenu'
import ExternalResourcesTab from './wiheSections/ExternalResourcesTab'
import FaqSection from './wiheSections/FaqSection'
import GuidesTab from './wiheSections/GuidesTab'

export default function WhatIsHealthEquityPage() {
  const [activeTab, setActiveTab] = useState<'guides' | 'resources'>('guides')

  const handleTabChange = (tab: 'guides' | 'resources') => {
    setActiveTab(tab)
  }

  return (
    <>
      <title>What is Health Equity? - Health Equity Tracker</title>

      <section
        id='main-content'
        aria-labelledby='main'
        tabIndex={-1}
        className='max-w-lgplus mx-auto flex w-svw flex-col justify-center px-8 py-16'
      >
        <h1
          id='main'
          className='font-sans-title text-alt-green text-big-header leading-normal font-bold'
        >
          What is Health Equity?
        </h1>

        <div className='xs:block smplus:flex-col my-4 flex grow items-center text-left'>
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
          <p className='text-title p-4 text-left md:text-center'>
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
        aria-label='Trending Topics'
        id='learning-section'
        className='bg-white-smoke'
      >
        <div className='max-w-lgplus mx-auto flex w-svw flex-col justify-center p-8'>
          <div className='max-w-lgplus mx-auto flex w-full flex-col justify-center'>
            <HetOverline text={'Trending Topics'} className='text-center' />
            <h2 className='font-sans-title text-alt-green text-header leading-modal-heading m-0 pb-5 text-center font-bold'>
              Don't know where to start?
            </h2>
            <p className='text-title my-4 text-center'>
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
        aria-label='Frequently Asked Questions'
        className='max-w-lgplus mx-auto flex w-svw items-center justify-center px-8 py-16 xl:px-0'
      >
        <FaqSection />
      </section>
    </>
  )
}
