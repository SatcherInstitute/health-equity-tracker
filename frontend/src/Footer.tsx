import HetReturnToTop from './styles/HetComponents/HetReturnToTop'
import HetLogos from './styles/HetComponents/HetLogos'
import HetFooterNav from './styles/HetComponents/HetFooterNav'

export default function Footer() {
  return (
    <div className=' m-auto flex min-h-[170px] w-screen justify-center bg-footerColor px-2.5 py-12'>
      <div className='max-w-xl'>
        <div className='grid grid-cols-1 px-10 lg:grid-cols-2'>
          <HetLogos />
          <HetFooterNav />
        </div>

        <div className='flex justify-center px-2 py-10 sm:justify-end  sm:py-2 lg:justify-center'>
          <HetReturnToTop />
        </div>
      </div>
    </div>
  )
}
