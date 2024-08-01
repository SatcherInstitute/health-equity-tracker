import HetNotice from '../../styles/HetComponents/HetNotice'
import { useParamState } from '../../utils/hooks/useParamState'
import { VOTE_DOT_ORG_PARAM_KEY } from '../../utils/urlutils'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'

export default function VoteDotOrgBanner() {
  const [_, setModalIsOpen] = useParamState(VOTE_DOT_ORG_PARAM_KEY)

  return (
    <HetNotice
      className='mx-2 mt-4 mb-2 lg:mb-4 lg:mt-4 lg:ml-2 border-0 text-left text-black bg-methodologyGreen'
      title='“The vote is precious. It is almost sacred. It is the most powerful
          non-violent tool we have in a democracy.” — John Lewis'
      kind='quote'
    >
      <HetLinkButton
        className='text-black font-semibold hover:translate-x-1 hover:transition-transform hover:duration-300'
        onClick={() => setModalIsOpen(true)}
      >
        {/* Mobile */}
        <span className='sm:hidden text-smallest'>
          Check your registration →
        </span>
        {/* Tablet/Desktop */}
        <span className='hidden sm:inline '>
          Check your voter registration now →
        </span>
      </HetLinkButton>
    </HetNotice>
  )
}
