import type { Citation } from '../../data/config/MetricConfigTypes'

/* Take an option citations config, and convert into a span of links to cited sources with hover titles */

interface InfoCitationsProps {
  citations?: Citation[]
}

export default function InfoCitations(props: InfoCitationsProps) {
  return (
    <span>
      {props.citations?.map((citation: Citation, i) => {
        return (
          <span key={`${citation.shortLabel}-${i}`}>
            {' '}
            <a
              key={citation.url + i}
              href={citation.url}
              title={citation.longerTitle}
            >
              {citation.shortLabel}
            </a>
          </span>
        )
      })}
    </span>
  )
}
