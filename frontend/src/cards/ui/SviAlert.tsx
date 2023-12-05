import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type Fips } from '../../data/utils/Fips'
import { urlMap } from '../../utils/externalUrls'
import { HashLink } from 'react-router-hash-link'
import { OLD_METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'
import HetAlert from '../../styles/HetComponents/HetAlert'

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
    return 'text-alt-green'
  }
  return 'text-black'
}

function SviAlert(props: SviAlertProps) {
  const rating = findRating(props.svi)
  const color = findColor(rating)

  return (
    <HetAlert severity={props.svi ? 'warning' : 'info'} className='m-2'>
      {props.svi ? (
        <>
          This county has a social vulnerability index of <b>{props.svi}</b>;
          which indicates a{' '}
          <HashLink to={`${OLD_METHODOLOGY_PAGE_LINK}#svi`} className={color}>
            <b>{rating} level of vulnerability.</b>
          </HashLink>
        </>
      ) : (
        <>
          We do not currently have the <b>social vulnerability index</b> for{' '}
          <b>{props.fips.getDisplayName()}</b>. Learn more about how this lack
          of data impacts <a href={urlMap.cdcSvi}>health equity.</a>
        </>
      )}
    </HetAlert>
  )
}

export default SviAlert
