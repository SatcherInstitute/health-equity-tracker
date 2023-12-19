import FiberNewIcon from '@mui/icons-material/FiberNew'
import {
  COVID_DEATHS_AGE_FULTON_COUNTY_SETTING,
  EXPLORE_DATA_PAGE_LINK,
  HIV_PREVALANCE_RACE_USA_SETTING,
  PHRMA_HIV_ELIGIBILITY_USA_MULTIMAP_SETTING,
  PRISON_VS_POVERTY_RACE_GA_SETTING,
  UNINSURANCE_SEX_FL_VS_CA_SETTING,
  WARM_WELCOME_DEMO_SETTING,
} from '../../utils/internalRoutes'
import styles from './DefaultHelperBox.module.scss'
import DisclaimerAlert from '../../reports/ui/DisclaimerAlert'

export default function DefaultHelperBox() {
  return (
    <div className='flex w-full items-center justify-center bg-white px-12 pb-0 pt-4 sm:px-20 sm:pt-8'>
      <section className='m-0 mb-5  grid w-full max-w-helperBox grid-cols-1 content-center  items-center justify-evenly justify-items-center rounded-md bg-standard-info pb-0 smMd:grid-cols-5'>
        <div className='col-span-3 px-10 py-0 text-left smMd:px-0 md:px-10 xl:col-span-2'>
          <h3 className='mt-4 pr-4 text-small sm:mt-8 sm:text-smallestHeader md:mt-0 lg:text-header'>
            Select a topic above...
          </h3>

          <h3 className='text-smallest sm:text-title xl:text-exploreButton'>
            or explore one of the following reports:
          </h3>

          <ul className='my-0 list-none pl-0 text-left'>
            <li className='mt-1 md:mt-2'>
              <a
                className='no-underline hover:underline'
                href={
                  EXPLORE_DATA_PAGE_LINK +
                  PHRMA_HIV_ELIGIBILITY_USA_MULTIMAP_SETTING
                }
              >
                HIV by Medicare eligibility <FiberNewIcon />
              </a>
            </li>
            <li className='mt-1 md:mt-2'>
              <a
                className='no-underline hover:underline'
                href={EXPLORE_DATA_PAGE_LINK + HIV_PREVALANCE_RACE_USA_SETTING}
              >
                HIV by race/ethnicity
              </a>
            </li>

            <li className='mt-1 md:mt-2'>
              <a
                className='no-underline hover:underline'
                href={
                  EXPLORE_DATA_PAGE_LINK +
                  COVID_DEATHS_AGE_FULTON_COUNTY_SETTING
                }
              >
                COVID-19 in Fulton County, Georgia, by age
              </a>
            </li>
            <li className='mt-1 md:mt-2'>
              <a
                className='no-underline hover:underline'
                href={
                  EXPLORE_DATA_PAGE_LINK + PRISON_VS_POVERTY_RACE_GA_SETTING
                }
              >
                Prison & poverty in Georgia, by race
              </a>
            </li>
            <li className='mt-1 md:mt-2'>
              <a
                className='no-underline hover:underline'
                href={EXPLORE_DATA_PAGE_LINK + UNINSURANCE_SEX_FL_VS_CA_SETTING}
              >
                Uninsurance in FL & CA, by sex
              </a>
            </li>
          </ul>
        </div>

        <div className='col-span-2 grid w-full place-content-center pt-8 smMd:px-12 xl:col-span-3'>
          <DisclaimerAlert className='mb-5 mt-1 smMd:hidden' />
          <div className={styles.NoTopicHelperVideoBox}>
            <iframe
              loading='lazy'
              className='h-[157px] w-[250px] max-w-[80vw] rounded-lg lg:h-[252px] lg:w-[400px] xl:h-[346px] xl:w-[550px]'
              src='https://www.youtube.com/embed/XBoqT9Jjc8w'
              title='YouTube video player'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            ></iframe>
          </div>
          <p className='px-4 pb-4 text-small italic md:px-4'>
            New to the tracker? Watch the video demo, or take a{' '}
            <a href={EXPLORE_DATA_PAGE_LINK + WARM_WELCOME_DEMO_SETTING}>
              guided tour of a COVID-19 report.
            </a>
          </p>
        </div>

        <DisclaimerAlert className='col-span-5 m-7 hidden smMd:block' />
      </section>
    </div>
  )
}
