import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { useParamState } from '../../utils/hooks/useParamState'
import { CHLP_MAPS_PARAM_KEY } from '../../utils/urlutils'

export default function CHLPMapsBanner() {
  const [_, setModalIsOpen] = useParamState(CHLP_MAPS_PARAM_KEY)

  return (
    <HetNotice
      className='mx-2 mt-4 mb-2 border-0 bg-teal-100 text-left text-black lg:mt-4 lg:mb-4 lg:ml-2'
      title='Explore local health resources and community services in your area through our interactive maps'
      kind='quote'
    >
      <HetLinkButton
        className='font-semibold text-black hover:translate-x-1 hover:transition-transform hover:duration-300'
        onClick={() => setModalIsOpen(true)}
      >
        {/* Mobile */}
        <span className='text-smallest sm:hidden'>View CHLP maps →</span>
        {/* Tablet/Desktop */}
        <span className='hidden sm:inline'>
          Explore Community Health Leaders Program maps →
        </span>
      </HetLinkButton>
    </HetNotice>
  )
}
