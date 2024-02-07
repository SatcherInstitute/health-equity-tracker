import TikTokIcon from '../../assets/icons/tiktok'
import { X, LinkedIn, YouTube } from '@mui/icons-material'
import { urlMap } from '../../utils/externalUrls'

interface HetSocialIconLinksProps {
  className?: string
  colorOverride?: 'altBlack' | 'white'
}

export default function HetSocialIconLinks(props: HetSocialIconLinksProps) {
  const colorClass = props.colorOverride ? `text-${props.colorOverride}` : ''

  return (
    <div className={`flex justify-center ${props.className ?? ''}`}>
      <a
        className={`mx-[7px] my-0 ${colorClass}`}
        href={urlMap.shliLinkedIn}
        aria-label='Satcher Health on LinkedIn'
      >
        <LinkedIn />
      </a>
      <a
        className={`mx-[8px] my-0 ${colorClass}`}
        href={urlMap.shliTwitter}
        aria-label='Satcher Health on X formerly Twitter'
      >
        <X fontSize={'small'} />
      </a>
      <a
        className={`mx-[7px] my-0 ${colorClass}`}
        href={urlMap.shliYoutube}
        aria-label='Satcher Health on YouTube'
      >
        <YouTube />
      </a>
      <a
        className={`mx-[7px] my-0 ${colorClass}`}
        href={urlMap.hetTikTok}
        aria-label='Health Equity Tracker on TikTok'
      >
        <TikTokIcon />
      </a>
    </div>
  )
}
