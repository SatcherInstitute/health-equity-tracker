import React from "react";
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
import DisclaimerAlert from "../../reports/ui/DisclaimerAlert";

const reportMapping = [
  {
    setting: HIV_PREVALANCE_RACE_USA_SETTING,
    title: "HIV by Race/Ethnicity",
    preview: "HIV Cases",
    description:
      "Uncover disparities in HIV prevalence across different racial and ethnic groups in the U.S. Understanding these patterns is vital for targeted interventions and improved health equity.",
    categories: ["HIV", "Prevalence", "Race/Ethnicity", "National-Level"],
  },
  {
    setting: COVID_DEATHS_AGE_FULTON_COUNTY_SETTING,
    title: "COVID-19 Deaths in Fulton County by Age",
    preview: "COVID-19 Deaths",
    description:
      "Analyze COVID-19 mortality in Fulton County, GA, by age. Highlighting vulnerable populations helps to inform public health strategies and resource allocation.",
    categories: ["COVID-19", "Deaths", "Age", "County-Level"],
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
  },
];

interface CategoryNamesProps {
  categories: string[];
}

const CategoryNames: React.FC<CategoryNamesProps> = ({ categories }) => {
  return (
    <div className="flex flex-wrap mt-2">
      {categories.map((name, index) => (
        <span
          key={index}
          className="category-span text-[10px] uppercase text-[#282c25] font-sansTitle font-bold bg-ashgray30 rounded-sm py-1 px-2 mr-2 mt-1"
        >
          {name}
        </span>
      ))}
    </div>
  );
};

export default function DefaultHelperBox() {
  return (
    <div className="flex w-full items-center justify-center px-12 pb-0 pt-4 sm:px-20 sm:pt-8">
      <section className="m-0 mb-5  w-full max-w-helperBox content-center items-center justify-evenly justify-items-center rounded-md pb-0 ">
        <div className=" px-10 py-0 text-left smMd:px-0 md:px-10">
          <h3 className="mt-4 pr-4 text-small sm:mt-8 sm:text-smallestHeader md:mt-0 lg:text-header">
            Select a topic above...
          </h3>
          <h3 className="text-smallest sm:text-title xl:text-exploreButton">
            or explore one of the following reports:
          </h3>

          <ul className="my-0 list-none pl-0 text-left">
            {reportMapping.map((report, index) => (
              <li className="my-4 flex" key={index}>
                <a
                  href={EXPLORE_DATA_PAGE_LINK + report.setting}
                  className="no-underline block w-full text-left p-4 bg-white rounded-md transition-transform duration-300 hover:scale-105 hover:shadow-raised-tighter group"
                >
                  <CategoryNames categories={report.categories} />
                  <h1 className="text-lg font-bold">
                    {report.title} {report.icon && report.icon}
                  </h1>
                  <p className="text-black">{report.description}</p>
                  <p className="p-0 m-0 no-underline opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    View More
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <DisclaimerAlert className="col-span-5 m-7 hidden smMd:block" />
      </section>
    </div>
  );
}
