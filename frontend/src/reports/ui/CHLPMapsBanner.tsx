import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { useParamState } from '../../utils/hooks/useParamState'
import { CHLP_MAPS_PARAM_KEY } from '../../utils/urlutils'

export default function CHLPMapsBanner() {
  const [_, setModalIsOpen] = useParamState(CHLP_MAPS_PARAM_KEY)

  return (
    <HetNotice
      className='mx-2 mt-4 mb-2 border-0 bg-methodology-green/50 text-left text-alt-black lg:mt-4 lg:mb-4 lg:ml-2'
      title={`HIV Criminalization`}
      kind='helpful-info'
    >
      Many states criminalize people living with HIV for conduct that is either
      not criminalized or criminalized less severely for people not living with
      HIV.
      <div className='mt-2'>
        <HetLinkButton
          className='font-semibold text-alt-black hover:translate-x-1 hover:transition-transform hover:duration-300'
          onClick={() => setModalIsOpen(true)}
        >
          <span className='font-semibold'>
            Open <span className='font-semibold sm:hidden'>CHLP</span>
            <span className='hidden font-semibold sm:inline'>
              Center for HIV Law and Policy (CHLP)
            </span>{' '}
            Maps
          </span>
        </HetLinkButton>
      </div>
    </HetNotice>
  )
}
