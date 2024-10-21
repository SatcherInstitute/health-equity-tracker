import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import FaqSection from '../ui/FaqSection'
import { HetOverline } from '../../styles/HetComponents/HetOverline'
import { HetTermRaised } from '../../styles/HetComponents/HetTermRaised'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import WIHECardMenu, { wiheConfigs } from './wiheComponents/WIHECardMenu'

export default function WhatIsHealthEquityPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [ref] = useResponsiveWidth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname === '/whatishealthequity') {
      navigate(wiheConfigs[0].path)
    }
  }, [location.pathname, navigate])

  return (
    <>
      <Helmet>
        <title>What is Health Equity? - Health Equity Tracker</title>
      </Helmet>

      <section
        id='main-content'
        aria-labelledby='page-heading'
        tabIndex={-1}
        className='flex flex-col w-svw justify-center max-w-lgXl py-16 px-8 mx-auto'
      >
        <header>
          <h1 className='font-sansTitle text-bigHeader font-bold leading-lhNormal text-altGreen'>
            What is Health Equity?
          </h1>
        </header>
        <h2 className='sr-only'>What is Health Equity?</h2>

        <div className='flex grow smMd:flex-col xs:block text-left items-center my-4'>
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
          <p className='text-left md:text-center text-title p-4'>
            Unfortunately, social and political determinants of health
            negatively affect many communities, their people, and their ability
            to lead healthy lives.
          </p>
        </div>

        <section id='learning-section' className='bg-whiteSmoke80'>
          <div className='flex flex-col w-svw justify-center max-w-lgXl p-8 mx-auto'>
            <div className='flex w-full flex-col justify-center max-w-lgXl mx-auto'>
              <HetOverline text={'Trending Topics'} className='text-center' />
              <h3 className='m-0 pb-5 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen text-center'>
                Don't know where to start?
              </h3>
              <p className='text-center my-4 text-title'>
                Discover how the Health Equity Tracker can be your tool to drive
                change and advance health equity in your community.
              </p>
            </div>
            <div
              ref={ref}
              className='flex flex-col justify-center md:justify-between items-center text-left'
            >
              <WIHECardMenu />
              <article className='flex flex-col justify-center w-full'>
                <Outlet />
              </article>
            </div>
          </div>
        </section>

        <section className='w-svw flex mx-auto py-16 lgXl:px-0 px-8 items-center justify-center max-w-lgXl'>
          <FaqSection />
        </section>
      </section>
    </>
  )
}
