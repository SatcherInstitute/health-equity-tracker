import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { useParamState } from '../../utils/hooks/useParamState'
import { VOTE_DOT_ORG_PARAM_KEY } from '../../utils/urlutils'

export default function VoteDotOrgBanner() {
  const [_, setModalIsOpen] = useParamState(VOTE_DOT_ORG_PARAM_KEY)

  return (
    <HetNotice
      className='mx-2 mt-4 mb-2 border-0 bg-methodology-green text-left text-black lg:mt-4 lg:mb-4 lg:ml-2'
      title='“The vote is precious. It is almost sacred. It is the most powerful
          non-violent tool we have in a democracy.” — John Lewis'
      kind='quote'
    >
      <HetLinkButton
        className='font-semibold text-black hover:translate-x-1 hover:transition-transform hover:duration-300'
        onClick={() => setModalIsOpen(true)}
      >
        {/* Mobile */}
        <span className='text-smallest sm:hidden'>
          Check your registration →
        </span>
        {/* Tablet/Desktop */}
        <span className='hidden sm:inline'>
          Check your voter registration now →
        </span>
      </HetLinkButton>
    </HetNotice>
  )
}
