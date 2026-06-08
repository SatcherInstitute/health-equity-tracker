import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useParamState } from '../../utils/hooks/useParamState'
import { CHLP_MAPS_PARAM_KEY } from '../../utils/urlutils'

export default function CHLPMapsBanner() {
  const [_, setModalIsOpen] = useParamState(CHLP_MAPS_PARAM_KEY)
  const isSmAndUp = useIsBreakpointAndUp('sm')

  return (
    <HetNotice
      className='mx-2 mt-4 mb-2 border-0 bg-methodology-green/50 text-left text-alt-black lg:mt-4 lg:mb-4 lg:ml-2'
      title={`HIV Criminalization`}
      kind='helpful-info'
    >
      Many states criminalize people living with HIV for conduct that is either
      not criminalized or criminalized less severely for people not living with
      HIV.
      <HetLinkButton
        className='block py-1 font-semibold text-alt-green text-smallest hover:translate-x-1 hover:transition-transform hover:duration-300'
        onClick={() => setModalIsOpen(true)}
      >
        Open {isSmAndUp ? 'Center for HIV Law and Policy (CHLP)' : 'CHLP'} Maps
      </HetLinkButton>
    </HetNotice>
  )
}
