import { type Citation } from '../../data/config/MetricConfig'

/* Take an option citations config, and convert into a span of links to cited sources with hover titles */

interface InfoCitationsProps {
  citations?: Citation[]
}

export default function InfoCitations(props: InfoCitationsProps) {
  return (
    <span>
      {props.citations?.map((citation: Citation, i) => {
        return (
<<<<<<< HEAD
<<<<<<< HEAD
          <span key={`${citation.shortLabel}-${i}`}>
=======
          <>
>>>>>>> a653f385 (RF: Update config citations; add hidden PHRMA citations (#2404))
=======
          <span key={`${citation.shortLabel}-${i}`}>
>>>>>>> c4bbb991 (Memoize `getHighestLowestGroupsByFips()`; remove unneeded alt text items from Maps (#2421))
            {' '}
            <a
              key={citation.url + i}
              href={citation.url}
              title={citation.longerTitle}
            >
              {citation.shortLabel}
            </a>
<<<<<<< HEAD
<<<<<<< HEAD
          </span>
=======
          </>
>>>>>>> a653f385 (RF: Update config citations; add hidden PHRMA citations (#2404))
=======
          </span>
>>>>>>> c4bbb991 (Memoize `getHighestLowestGroupsByFips()`; remove unneeded alt text items from Maps (#2421))
        )
      })}
    </span>
  )
}
