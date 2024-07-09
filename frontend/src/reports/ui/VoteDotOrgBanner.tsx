import HowToVoteIcon from '@mui/icons-material/HowToVote';
import HetNotice from '../../styles/HetComponents/HetNotice'
import { DataTypeId } from '../../data/config/MetricConfig'
import { useParamState } from '../../utils/hooks/useParamState'
import { VOTE_DOT_ORG_PARAM_KEY } from '../../utils/urlutils'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import { het } from '../../styles/DesignTokens'

export const LIFELINE_IDS: DataTypeId[] = ['suicide', 'gun_violence_suicide']

export default function VoteDotOrgBanner() {

  const [_, setModalIsOpen] =
    useParamState(VOTE_DOT_ORG_PARAM_KEY)

  return (
    <HetNotice
      className='mx-2 mt-4 mb-2 lg:mb-4 lg:mt-4 lg:ml-2 border border-secondaryMain text-left text-small'
      // icon={<HowToVoteIcon color='primary' />}
      title='Are You Registered To Vote?'
      kind='helpful-info'
    >
      <p>

      </p>
      <HetLinkButton
        onClick={() => setModalIsOpen(true)}
      >
        Quickly check with Vote.org <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={het.altGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 7L7 17" />
          <path d="M7 7h10v10" />
        </svg>
      </HetLinkButton>
    </HetNotice>
  )
}
