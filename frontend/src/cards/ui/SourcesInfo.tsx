import { Fragment } from 'react'
import { DATA_CATALOG_PAGE_LINK } from '../../utils/internalRoutes'
import {
  LinkWithStickyParams,
  DATA_SOURCE_PRE_FILTERS,
} from '../../utils/urlutils'
import { type DataSourceInfo, insertPunctuation } from './SourcesHelpers'

interface SourcesInfoProps {
  dataSourceMap: Record<string, DataSourceInfo>
}

export default function SourcesInfo(props: SourcesInfoProps) {
  return (
    <p className="text-smallest">
      Sources:{' '}
      {Object.keys(props.dataSourceMap).map((dataSourceId, idx) => (
        <Fragment key={dataSourceId}>
          <LinkWithStickyParams
            target="_blank"
            to={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${dataSourceId}`}
          >
            {props.dataSourceMap[dataSourceId].name}
          </LinkWithStickyParams>{' '}
          {props.dataSourceMap[dataSourceId].updateTimes.size === 0 ? (
            <>(last update unknown) </>
          ) : (
            <>
              (updated{' '}
              {Array.from(props.dataSourceMap[dataSourceId].updateTimes).join(
                ', '
              )}
              )
            </>
          )}
          {insertPunctuation(idx, Object.keys(props.dataSourceMap).length)}
        </Fragment>
      ))}{' '}
    </p>
  )
}
