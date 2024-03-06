import { useAtomValue } from 'jotai';
import { HashLink } from 'react-router-hash-link';
import {
	type DatasetId,
	type DatasetIdWithStateFIPSCode,
	DatasetMetadataMap,
} from '../../data/config/DatasetMetadata';
import {
	type DataTypeConfig,
	type DropdownVarId,
} from '../../data/config/MetricConfig';
import { PHRMA_DATATYPES } from '../../data/providers/PhrmaProvider';
import { type MetricQueryResponse } from '../../data/query/MetricQuery';
import { type MapOfDatasetMetadata } from '../../data/utils/DatasetTypes';
import {
	getConfigFromDataTypeId,
	getParentDropdownFromDataTypeId,
} from '../../utils/MadLibs';
import { OLD_METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes';
import {
	selectedDataTypeConfig1Atom,
	selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState';
import {
	getDataSourceMapFromDatasetIds,
	getDatasetIdsFromResponses,
	stripCountyFips,
} from './SourcesHelpers';
import SourcesInfo from './SourcesInfo';

interface SourcesProps {
	queryResponses: MetricQueryResponse[];
	metadata: MapOfDatasetMetadata;
	isCensusNotAcs?: boolean;
	hideNH?: boolean;
	downloadTargetScreenshot?: () => Promise<boolean>;
	isMulti?: boolean;
	showDefinition?: boolean;
	isCompareCard?: boolean;
}

export function Sources(props: SourcesProps) {
	// If all data is missing, no need to show sources.
	if (props.queryResponses.every((resp) => resp.dataIsMissing())) {
		return <></>;
	}

	const unstrippedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> =
		getDatasetIdsFromResponses(props.queryResponses);
	let datasetIds: DatasetId[] = stripCountyFips(unstrippedDatasetIds);

	// for Age Adj only, swap ACS source(s) for Census Pop Estimate
	if (props.isCensusNotAcs) {
		datasetIds = datasetIds.filter((datasetId) => !datasetId.includes('acs'));
		datasetIds.push('census_pop_estimates-race_and_ethnicity');
	}

	const dataSourceMap = getDataSourceMapFromDatasetIds(
		datasetIds,
		props.metadata,
	);

	const selectedDataTypeConfigAtom = props.isCompareCard
		? selectedDataTypeConfig2Atom
		: selectedDataTypeConfig1Atom;

	const selectedDataTypeId = useAtomValue(
		selectedDataTypeConfigAtom,
	)?.dataTypeId;

	const methodologyHashId: DropdownVarId | '' = selectedDataTypeId
		? getParentDropdownFromDataTypeId(selectedDataTypeId)
		: '';

	let optionalDefinition = '';

	if (
		props.showDefinition &&
		selectedDataTypeId &&
		PHRMA_DATATYPES.includes(selectedDataTypeId)
	) {
		const selectedDataTypeConfig: DataTypeConfig | null = selectedDataTypeId
			? getConfigFromDataTypeId(selectedDataTypeId)
			: null;

		const dtName = selectedDataTypeConfig?.fullDisplayName;
		const dtDefinition = selectedDataTypeConfig?.definition?.text;

		if (dtName && dtDefinition)
			optionalDefinition = `${dtName}: ${dtDefinition} `;
	}

	const showNhFootnote =
		!props.hideNH &&
		datasetIds.some((id) => DatasetMetadataMap[id]?.contains_nh);

	return (
		<footer className='px-1 py-0 text-left text-smallest'>
			<p className='w-full'>
				{optionalDefinition}
				View{' '}
				<HashLink to={`${OLD_METHODOLOGY_PAGE_LINK}#${methodologyHashId}`}>
					methodology
				</HashLink>
				.
			</p>

			{/* NH note (if needed) listed first, full-width */}
			<div className='w-full'>
				{showNhFootnote && (
					<p className='mb-0 mt-1'>
						Note. NH: Non-Hispanic. To promote inclusion, we replace the source
						data labels <i>‘Multiracial’</i> with <i>‘Two or more races’</i>,
						and <i>‘Some other’</i> with <i>‘Unrepresented’</i>.{' '}
					</p>
				)}
			</div>

			<div
				className={`${
					props.isMulti ? 'xs:w-8/12 sm:w-9/12 md:w-10/12' : 'w-full'
				}`}
			>
				<SourcesInfo dataSourceMap={dataSourceMap} />
			</div>
		</footer>
	);
}
