import type { DataSourceId } from '../../data/config/MetadataMap'
import { DATA_CATALOG_PAGE_LINK } from '../../utils/internalRoutes'
import {
  DATA_SOURCE_PRE_FILTERS,
  LinkWithStickyParams,
} from '../../utils/urlutils'
import { type DataSourceInfo, insertPunctuation } from './SourcesHelpers'

interface SourcesInfoProps {
  dataSourceMap: Record<DataSourceId, DataSourceInfo>
}

export default function SourcesInfo(props: SourcesInfoProps) {
  const dataSourceIds = Object.keys(props.dataSourceMap) as DataSourceId[]
  return (
    <p>
      Sources:{' '}
      {dataSourceIds.map((dataSourceId, idx) => (
        <span key={dataSourceId}>
          <LinkWithStickyParams
            target='_blank'
            to={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${dataSourceId}`}
          >
            {props.dataSourceMap[dataSourceId].name}
          </LinkWithStickyParams>{' '}
          {props.dataSourceMap[dataSourceId].updateTimes.size === 0 ? (
            <>(last update unknown) </>
          ) : (
            <>
              (data from{' '}
              {Array.from(props.dataSourceMap[dataSourceId].updateTimes).join(
                ', ',
              )}
              )
            </>
          )}
          {insertPunctuation(idx, Object.keys(props.dataSourceMap).length)}
        </span>
      ))}{' '}
    </p>
  )
}
