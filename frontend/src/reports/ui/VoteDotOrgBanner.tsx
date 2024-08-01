import HowToVoteIcon from '@mui/icons-material/HowToVote'
import HetNotice from '../../styles/HetComponents/HetNotice'
import type { DataTypeId } from '../../data/config/MetricConfig'
import { useParamState } from '../../utils/hooks/useParamState'
import { VOTE_DOT_ORG_PARAM_KEY } from '../../utils/urlutils'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import { het } from '../../styles/DesignTokens'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'

export const LIFELINE_IDS: DataTypeId[] = ['suicide', 'gun_violence_suicide']

export default function VoteDotOrgBanner() {
  const [_, setModalIsOpen] = useParamState(VOTE_DOT_ORG_PARAM_KEY)

  return (
    <HetNotice
      className='mx-2 mt-4 mb-2 lg:mb-4 lg:mt-4 lg:ml-2 border border-altDark text-left text-black bg-white'
      title='“The vote is precious. It is almost sacred. It is the most powerful
          non-violent tool we have in a democracy.” — John Lewis'
      kind='quote'
    >
      <HetLinkButton
        className='text-black'
        onClick={() => setModalIsOpen(true)}
      >
        Check your voter registration now →
      </HetLinkButton>
    </HetNotice>
  )
}
