import { LinkedIn, YouTube } from '@mui/icons-material'
import TikTokIcon from '../../assets/icons/tiktok'
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
        href={urlMap.hetLinkedIn}
        aria-label='Health Equity Tracker on LinkedIn'
      >
        <LinkedIn />
      </a>
      <a
        className={`mx-[7px] my-0 ${colorClass}`}
        href={urlMap.hetYouTubeShorts}
        aria-label='Health Equity Tracker on YouTube Shorts'
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
