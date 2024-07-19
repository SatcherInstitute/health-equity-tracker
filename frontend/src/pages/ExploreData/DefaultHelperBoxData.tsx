import Custom100kBarChartCompare from "../../reports/Custom100kBarChartCompare";
import Custom100kMap from "../../reports/Custom100kMap";
import CustomDisparityBarChartCompare from "../../reports/CustomDisparityBarChartCompare";
import CustomRateTrendsLineChart from "../../reports/CustomRateTrendsLineChart";
import CustomShareTrendsLineChart from "../../reports/CustomShareTrendsLineChart";
import FiberNewIcon from '@mui/icons-material/FiberNew'

export const reportMapping = [
	{
		setting: "medicare-hiv",
		title: "HIV Disparity Maps by Medicare Eligibility",
		preview: "Medicare HIV Cases",
		description:
			"Visualize HIV disparities among Medicare beneficiaries. These insights are essential for optimizing treatment and reducing health inequities.",
		categories: [
			"HIV",
			"Medication Utilization in the Medicare Population",
			"Multiple Maps",
			"National-Level",
		],
		icon: <FiberNewIcon />,
		previewImg: "/img/screenshots/sample-report_medicare.png",
		customCard: <Custom100kMap openMultiMap={false} />,
	},
	{
		setting: "hiv",
		title: "HIV by Race/Ethnicity",
		preview: "HIV Cases",
		description:
			"Uncover disparities in HIV prevalence across different racial and ethnic groups in the U.S. Understanding these patterns is vital for targeted interventions and improved health equity.",
		categories: ["HIV", "Prevalence", "Race/Ethnicity", "National-Level"],
		previewImg: "/img/screenshots/sample-report_hiv.png",
		customCard: <CustomRateTrendsLineChart />,
	},
	{
		setting: "covid",
		title: "COVID-19 Deaths in Fulton County by Age",
		preview: "COVID-19 Deaths",
		description:
			"Analyze COVID-19 mortality in Fulton County, GA, by age. Highlighting vulnerable populations helps to inform public health strategies and resource allocation.",
		categories: ["COVID-19", "Deaths", "Age", "County-Level"],
		previewImg: "/img/screenshots/sample-report_covid.png",
		customCard: <CustomShareTrendsLineChart />,
	},
	{
		setting: "prison-poverty",
		title: "Prison & Poverty in Georgia by Race",
		preview: "Prison + Poverty",
		description:
			"Explore the intersection of incarceration, poverty, and race in Georgia. Addressing these disparities is key to improving health outcomes and social justice.",
		categories: [
			"Social Determinants of Health",
			"Political Determinants of Health",
			"Race/Ethnicity",
			"State-Level",
			"Compare Topics",
		],
		previewImg: "/img/screenshots/sample-report_ga.png",
		customCard: <Custom100kBarChartCompare />,
	},
	{
		setting: "uninsurance",
		title: "Uninsurance in FL & CA by Sex",
		preview: "Uninsured",
		description:
			"Examine uninsurance rates by sex in Florida and California. Identifying these gaps is crucial for advancing equitable healthcare access.",
		categories: [
			"Social Determinants of Health",
			"State-Level",
			"Sex",
			"Compare Places",
		],
		previewImg: "/img/screenshots/sample-report_uninsured.png",
		customCard: <CustomDisparityBarChartCompare />,
	},
];
