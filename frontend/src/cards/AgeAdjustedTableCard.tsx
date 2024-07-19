import { AgeAdjustedTableChart } from "../charts/AgeAdjustedTableChart";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import { type Fips } from "../data/utils/Fips";
import {
	Breakdowns,
	type DemographicType,
	DEMOGRAPHIC_DISPLAY_TYPES,
	DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from "../data/query/Breakdowns";
import {
	type MetricConfig,
	type MetricId,
	type DataTypeConfig,
	getAgeAdjustedRatioMetric,
	type DropdownVarId,
	METRIC_CONFIG,
} from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import {
	NON_HISPANIC,
	RACE,
	ALL,
	WHITE_NH,
	MULTI_OR_OTHER_STANDARD_NH,
	AGE,
	SEX,
	type RaceAndEthnicityGroup,
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { AGE_ADJUSTMENT_LINK } from "../utils/internalRoutes";
import UnknownsAlert from "./ui/UnknownsAlert";
import { Link } from "react-router-dom";
import { splitIntoKnownsAndUnknowns } from "../data/utils/datasetutils";
import { type ScrollableHashId } from "../utils/hooks/useStepObserver";
import { generateChartTitle } from "../charts/utils";
import HetNotice from "../styles/HetComponents/HetNotice";

/* minimize layout shift */
const PRELOAD_HEIGHT = 600;

// choose demographic groups to exclude from the table
const exclusionList: RaceAndEthnicityGroup[] = [
	ALL,
	NON_HISPANIC,
	WHITE_NH,
	MULTI_OR_OTHER_STANDARD_NH,
];

interface AgeAdjustedTableCardProps {
	fips: Fips;
	dataTypeConfig: DataTypeConfig;
	demographicType: DemographicType;
	dropdownVarId?: DropdownVarId;
	reportTitle: string;
}

export default function AgeAdjustedTableCard(props: AgeAdjustedTableCardProps) {
	const metrics = getAgeAdjustedRatioMetric(props?.dataTypeConfig);
	const metricConfigPctShare = props.dataTypeConfig?.metrics?.pct_share;

	const raceBreakdowns = Breakdowns.forFips(props.fips).addBreakdown(
		RACE,
		exclude(...exclusionList),
	);

	const ageBreakdowns = Breakdowns.forFips(props.fips).addBreakdown(
		AGE,
		exclude(...exclusionList),
	);

	const metricConfigs: Record<string, MetricConfig> = {};
	metrics.forEach((metricConfig) => {
		metricConfigs[metricConfig.metricId] = metricConfig;
	});

	const metricIds = Object.keys(metricConfigs) as MetricId[];
	const raceQuery = new MetricQuery(
		/* metricIds */ metricIds,
		/* breakdowns */ raceBreakdowns,
		/* dataTypeId */ undefined,
		/* timeView */ "current",
	);
	const ageQuery = new MetricQuery(
		/* metricIds */ metricIds,
		/* breakdowns */ ageBreakdowns,
		/* dataTypeId */ undefined,
		/* timeView */ "current",
	);

	const queries = [raceQuery, ageQuery].filter(
		(query) => query.metricIds.length > 0,
	);
	const ratioId = metricIds[0];
	const ratioConfigs: MetricConfig[] = Object.values(metricConfigs).filter(
		(config) => config.type === "age_adjusted_ratio",
	);

	const chartTitle = metricConfigs?.[ratioId]?.chartTitle
		? generateChartTitle(metricConfigs[ratioId].chartTitle, props.fips)
		: `Age-adjusted Ratios for ${props.dataTypeConfig.fullDisplayName}`;

	// collect data types from the currently selected condition that offer age-adjusted ratios
	const dropdownId: DropdownVarId | null = props.dropdownVarId ?? null;
	const ageAdjustedDataTypes: DataTypeConfig[] = dropdownId
		? METRIC_CONFIG[dropdownId].filter((dataType) => {
				// TODO: once every data type has a unique dataTypeId across all topics, we can simply check if that id is in the dataTypeLinkMap
				return dataType?.metrics.age_adjusted_ratio?.ageAdjusted;
			})
		: [];

	const HASH_ID: ScrollableHashId = "age-adjusted-ratios";

	return (
		<CardWrapper
			downloadTitle={chartTitle}
			isCensusNotAcs={props.dropdownVarId === "covid"}
			minHeight={PRELOAD_HEIGHT}
			queries={queries}
			scrollToHash={HASH_ID}
			reportTitle={props.reportTitle}
		>
			{(queries) => {
				if (queries.length < 2)
					return (
						<MissingDataAlert
							demographicTypeString={
								DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
							}
							dataName={chartTitle}
							fips={props.fips}
						/>
					);

				const [raceQueryResponse, ageQueryResponse] = queries;

				const [knownRaceData] = splitIntoKnownsAndUnknowns(
					raceQueryResponse.data,
					RACE,
				);

				const isWrongDemographicType = props.demographicType === SEX;
				const noRatios = knownRaceData.every(
					(row) => row[ratioId] === undefined,
				);

				return (
					<>
						{metricConfigPctShare && (
							<UnknownsAlert
								metricConfig={metricConfigPctShare}
								queryResponse={raceQueryResponse}
								demographicType={
									props.demographicType === AGE ||
									props.demographicType === RACE
										? RACE
										: props.demographicType
								}
								ageQueryResponse={ageQueryResponse}
								displayType="table"
								known={true}
								overrideAndWithOr={props.demographicType === RACE}
								fips={props.fips}
							/>
						)}

						{/* If TABLE can't display for any of these various reasons, show the missing data alert */}
						{(noRatios ||
							isWrongDemographicType ||
							raceQueryResponse.dataIsMissing() ||
							raceQueryResponse.shouldShowMissingDataMessage(metricIds)) && (
							<MissingDataAlert
								dataName={chartTitle}
								demographicTypeString={
									DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]
								}
								ageAdjustedDataTypes={ageAdjustedDataTypes}
								fips={props.fips}
							/>
						)}

						{/* values are present or partially null, implying we have at least some age-adjustments */}
						{!raceQueryResponse.dataIsMissing() &&
							!noRatios &&
							props.demographicType !== SEX && (
								<AgeAdjustedTableChart
									data={knownRaceData}
									metricConfigs={ratioConfigs}
									title={chartTitle}
								/>
							)}
						{/* Always show info on what age-adj is */}
						<HetNotice>
							Age-adjustment is a statistical process applied to rates of
							disease, death, or other health outcomes that correlate with an
							individual's age. Adjusting for age allows for fairer comparison
							between populations, where age might be a confounding risk factor
							and the studied groups have different distributions of individuals
							per age group. By normalizing for age, we can paint a more
							accurate picture of undue burden of disease and death between
							populations. More details can be found in our{" "}
							<Link to={AGE_ADJUSTMENT_LINK}>age-adjustment methodology</Link>.
						</HetNotice>
					</>
				);
			}}
		</CardWrapper>
	);
}
