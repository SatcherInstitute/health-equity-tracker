import { Toolbar } from '@mui/material'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { PAGE_URL_TO_NAMES } from '../../utils/urlutils'
import HetLinkButton from './HetLinkButton'

export default function HetAppToolbar() {
  return (
    <Toolbar className='flex min-h-[65px] justify-between border-0 border-b border-solid border-black bg-white p-2 leading-lhSomeSpace'>
      <h1 className='m-0'>
        <HetLinkButton className='flex items-center pl-0' href='/'>
          <img
            src={AppBarLogo}
            className='h-littleHetLogo w-littleHetLogo'
            alt='Health Equity Tracker logo'
          />
          <span className='grow pl-5 text-left font-sansTitle text-navBarHeader font-medium  leading-lhSomeSpace text-alt-green no-underline'>
            Health Equity Tracker
          </span>
        </HetLinkButton>
      </h1>

      <nav className='flex max-w-sm flex-wrap justify-evenly lg:max-w-lg'>
        {Object.entries(PAGE_URL_TO_NAMES).map(([pageUrl, pageName]) => (
          <HetLinkButton
            key={pageUrl}
            href={pageUrl}
            className='my-0 w-auto p-0 px-0 font-sansTitle text-small font-medium text-navlink-color '
          >
            {pageName}
          </HetLinkButton>
        ))}
      </nav>
    </Toolbar>
  )
}
