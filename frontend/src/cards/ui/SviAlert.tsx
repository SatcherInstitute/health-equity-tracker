import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { Fips } from '../../data/utils/Fips'
import { urlMap } from '../../utils/externalUrls'
import { HashLink } from 'react-router-hash-link'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

interface SviAlertProps {
  svi: number
  sviQueryResponse: MetricQueryResponse | null
  fips: Fips
}

export const findRating = (svi: number) => {
  if (svi < 0.34) {
    return 'low'
  }
  if (svi >= 0.34 && svi <= 0.66) {
    return 'medium'
  }
  if (svi > 0.66) {
    return 'high'
  }
  return 'Insufficient data'
}

export const findVerboseRating = (svi: number) => {
  const rating = findRating(svi)
  if (rating === 'Insufficient data') {
    return 'Insufficient data'
  }
  return `${rating[0].toUpperCase() + rating.slice(1)} vulnerability`
}

export const findColor = (rating: string) => {
  if (rating === 'high') {
    return 'text-alt-red'
  }
  if (rating === 'medium') {
    return 'text-alt-orange'
  }
  if (rating === 'low') {
    return 'text-altGreen'
  }
  return 'text-black'
}

function SviAlert(props: SviAlertProps) {
  const rating = findRating(props.svi)
  const color = findColor(rating)

  return (
    <HetNotice
      kind={props.svi ? 'data-integrity' : 'helpful-info'}
      className='m-2'
    >
      {props.svi ? (
        <>
          This county has a <HetTerm>social vulnerability index</HetTerm> of{' '}
          <strong>{props.svi}</strong>; which indicates a{' '}
          <HashLink
            to={`${METHODOLOGY_PAGE_LINK as string}#svi`}
            className={color}
          >
            <span>{rating} level of vulnerability.</span>
          </HashLink>
        </>
      ) : (
        <>
          We do not currently have the{' '}
          <HetTerm>social vulnerability index</HetTerm> for{' '}
          <span>{props.fips.getDisplayName()}</span>. Learn more about how this
          lack of data impacts <a href={urlMap.cdcSvi}>health equity.</a>
        </>
      )}
    </HetNotice>
  )
}

export default SviAlert
