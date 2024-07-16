import React, { useState } from "react";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import {
	COVID_DEATHS_AGE_FULTON_COUNTY_SETTING,
	EXPLORE_DATA_PAGE_LINK,
	HIV_PREVALANCE_RACE_USA_SETTING,
	PHRMA_HIV_ELIGIBILITY_USA_MULTIMAP_SETTING,
	PRISON_VS_POVERTY_RACE_GA_SETTING,
	UNINSURANCE_SEX_FL_VS_CA_SETTING,
	WARM_WELCOME_DEMO_SETTING,
} from "../../utils/internalRoutes";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import TextLink from "../../reports/ui/TextLink";

const reportMapping = [
	{
		setting: HIV_PREVALANCE_RACE_USA_SETTING,
		title: "HIV by Race/Ethnicity",
		preview: "HIV Cases",
		description:
			"Uncover disparities in HIV prevalence across different racial and ethnic groups in the U.S. Understanding these patterns is vital for targeted interventions and improved health equity.",
		categories: ["HIV", "Prevalence", "Race/Ethnicity", "National-Level"],
		previewImg: "/img/screenshots/sample-report_hiv.png",
		iframeSrc:
			"https://healthequitytracker.org/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence#rate-map",
	},
	{
		setting: COVID_DEATHS_AGE_FULTON_COUNTY_SETTING,
		title: "COVID-19 Deaths in Fulton County by Age",
		preview: "COVID-19 Deaths",
		description:
			"Analyze COVID-19 mortality in Fulton County, GA, by age. Highlighting vulnerable populations helps to inform public health strategies and resource allocation.",
		categories: ["COVID-19", "Deaths", "Age", "County-Level"],
		previewImg: "/img/screenshots/sample-report_covid.png",
		iframeSrc:
			"https://healthequitytracker.org/exploredata?mls=1.covid-3.13121&group1=All&group2=All&dt1=covid_deaths&demo=age#population-vs-distribution",
	},
	{
		setting: PRISON_VS_POVERTY_RACE_GA_SETTING,
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
		iframeSrc:
			"https://healthequitytracker.org/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison#rate-map",
	},
	{
		setting: UNINSURANCE_SEX_FL_VS_CA_SETTING,
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
		iframeSrc:
			"https://healthequitytracker.org/exploredata?mls=1.health_insurance-3.12-5.06&mlp=comparegeos&demo=sex#rates-over-time",
	},
	{
		setting: PHRMA_HIV_ELIGIBILITY_USA_MULTIMAP_SETTING,
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
		iframeSrc:
			"https://healthequitytracker.org/exploredata?mls=1.medicare_hiv-3.00&group1=All&demo=eligibility&dt1=medicare_hiv&multiple-maps=true",
	},
];

interface CategoryNamesProps {
	categories: string[];
}

const CategoryNames: React.FC<CategoryNamesProps> = ({ categories }) => {
	return (
		<div className="flex flex-wrap mt-2 xl:visible lg:visible md:visible sm:collapse xs:collapse">
			{categories.map((name, index) => (
				<span
					key={index}
					className="category-span text-[10px] uppercase text-altBlack font-sansTitle font-bold bg-ashgray30 rounded-sm py-1 px-2 mr-2 mt-1 "
				>
					{name}
				</span>
			))}
		</div>
	);
};

const EmbeddedIframe: React.FC<{ src: string }> = ({ src }) => {
	return (
		<div
			className="px-8 sm:p-2 xs:p-2 my-0 bg-methodologyGreen"
			style={{
				width: "100%",
				height: "500px",
				marginTop: "1rem",
				overflow: "hidden",
			}}
		>
			<iframe
				src={src}
				style={{
					width: "200%",
					height: "165%",
					transform: "scale(0.5)",
					transformOrigin: "0 0",
					border: "none",
				}}
				title="Embedded Report"
			/>
		</div>
	);
};

export default function DefaultHelperBox() {
	const [showIframe, setShowIframe] = useState<{ [key: number]: boolean }>({});

	const toggleIframe = (index: number) => {
		setShowIframe((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	return (
		<div className="flex w-full items-center justify-center px-12 pb-0 pt-4 sm:px-20 sm:pt-8">
			<section className="m-0 mb-5 w-full max-w-helperBox content-center items-center justify-evenly justify-items-center rounded-md pb-0">
				<div className="px-10 py-0 text-left smMd:px-0 md:px-10 xs:px-2">
					<h3 className="m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen text-base text-center">
						Select a topic above
					</h3>
					<p className="text-text text-center">
						or explore one of the following reports:
					</p>

					<ul className="my-0 list-none pl-0 text-left flex flex-wrap">
						{reportMapping.map((report, index) => (
							<li
								className="my-4 xs:my-2 mx-0 flex flex-col bg-white rounded-md hover:shadow-raised group border border-solid border-altGreen transition-all duration-300 ease-in-out"
								key={index}
							>
								<div className="text-left p-4 text-altGreen flex xl:flex-row lg:flex-row md:flex-row xs:flex-wrap">
									<div
										className="bg-cover bg-no-repeat xl:mr-8 lg:mr-8 md:mr-8 sm:mb-4 xs:mb-4 xl:w-[40%] lg:w-[40%] md:w-[40%] sm:w-[100%] xs:w-[100%] h-[18rem]"
										style={{
											backgroundImage: `url(${report.previewImg})`,
										}}
									></div>
									<div className="flex flex-col xl:max-w-[55%] lg:max-w-[55%] md:max-w-[55%] size-auto">
										<CategoryNames categories={report.categories} />
										<h1 className="text-lg font-medium my-4 text-base">
											{report.title} {report.icon && report.icon}
										</h1>
										<p className="text-black xl:visible lg:visible md:visible sm:collapse xs:collapse">
											{report.description}
										</p>
										<TextLink
											link={EXPLORE_DATA_PAGE_LINK + report.setting}
											linkText="Explore this report"
										/>
									</div>
								</div>

								<div className="flex flex-col bg-methodologyGreen rounded-md m-8 p-0">
									<button
										onClick={(e) => {
											e.preventDefault();
											toggleIframe(index);
										}}
										className="text-text text-black font-medium text-altGreen no-underline border-none w-auto cursor-pointer bg-methodologyGreen rounded-md py-4"
									>
										<span className="mx-1">
											{showIframe[index] ? "Hide" : "Preview the data"}
											{showIframe[index] ? <ArrowDropUp /> : <ArrowDropDown />}
										</span>
									</button>
									{showIframe[index] && (
										<EmbeddedIframe src={report.iframeSrc} />
									)}
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>
		</div>
	);
}
