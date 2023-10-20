interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

export const dataCatalog: DataItem[] = [
  {
    topic: 'CDC Case Surveillance Restricted Access Detailed Data',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'This dataset provides comprehensive information on confirmed COVID-19 deaths, cases, and hospitalizations at national, state, and county levels.',
      },
      {
        key: 'Origin',
        description:
          'Centers for Disease Control and Prevention, COVID-19 Response.',
      },
      {
        key: 'Time Series Range',
        description: 'January 2020 - Current',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly',
      },
      {
        key: 'Source Website',
        description:
          '[data.cdc.gov](https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t)',
      },
      {
        key: 'Notes',
        description:
          'The numbers of confirmed COVID-19 deaths, cases, and hospitalizations nationally and at the state and county levels. The data source is Centers for Disease Control and Prevention, COVID-19 Response. COVID-19 Case Surveillance Data Access, Summary, and Limitations. The last case data included is two (2) weeks before they most recent release from the CDC. The CDC does not take responsibility for the scientific validity or accuracy of methodology, results, statistical analyses, or conclusions presented. We only present the data as rates that are calculated with the American Community Survey (ACS) 2019 5-year estimates, to view the raw data you must apply for access on the CDC website linked above.',
      },
    ],
  },
  {
    topic: 'Metrics',
    path: '',
    definitions: [
      {
        key: 'Total COVID-19 cases per 100k people',
        description:
          'The total rate of occurrence of COVID-19 cases expressed per 100,000 people (i.e. 10,000 per 100k implies a 10% occurrence rate). This metric normalizes for population size, allowing for comparisons across demographic groups. This metric is rounded to the nearest integer in the tracker.',
      },
      {
        key: 'Share of total COVID-19 cases with unknown race and ethnicity',
        description:
          'Within a locale, the percentage of COVID-19 cases that reported unknown race/ethnicity. For example, a value of 20% for Georgia means that 20% of Georgia’s reported cases had unknown race/ethnicity. This metric is rounded to one decimal place. In instances where this would round to 0%, two decimal places are used.',
      },
      {
        key: 'Share of total COVID-19 cases',
        description: `To demonstrate the often inequitable distribution of a condition or disease, we calculate each demographic group’s relative inequity using the ${'<code>'}(OBSERVED - EXPECTED) / EXPECTED${'</code>'}. In this case, ${'<code>'}OBSERVED${'</code>'} is each group's percent share of the condition, and ${'<code>'}EXPECTED${'</code>'} is that group's share of the total population. This calculation is done for every point in time for which we have data, allowing visualization of inequity relative to population, over time.`,
      },
      {
        key: 'Population share',
        description:
          'The percentage of the total population that identified as a particular race/ethnicity in the ACS survey. This metric is rounded to one decimal place. In instances where this would round to 0%, two decimal places are used.',
      },
      {
        key: 'Relative inequity for COVID-19 cases',
        description:
          'COVID-19 vaccinations are an important tool for preventing the spread of the virus and protecting people from serious illness. However, vaccination rates vary significantly across different populations. Studying COVID-19 vaccinations in regard to health equity can help us to understand why these disparities exist and how to increase vaccination rates among all populations.',
      },
    ],
  },
  {
    topic: 'Condition Variables',
    path: '',
    definitions: [
      {
        key: 'COVID-19 cases',
        description:
          'A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a “case definition”. Cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.',
      },
      {
        key: 'COVID-19 deaths',
        description: 'The number of people who died due to COVID-19.',
      },
      {
        key: 'COVID-19 hospitalizations',
        description:
          'The number of people hospitalized at any point while ill with COVID-19.',
      },
      {
        key: 'COVID-19 vaccinations',
        description:
          'For the national level and most states this indicates people who have received at least one dose of a COVID-19 vaccine.',
      },
    ],
  },
]

// interface Dataset {
//   title: string
//   introduction: string
//   dataSources: {
//     origin: string
//     timeframe?: string
//     geographicLevel: string
//     demographicGranularity: string
//     dataCollection: {
//       updateFrequency: string
//       sourceWebsite: string
//     }
//     notes?: string
//   }
// }

// const datasources: Dataset[] = [
//   {
//     title: 'CDC Case Surveillance Restricted Access Detailed Data',
//     introduction:
//       'This dataset provides comprehensive information on confirmed COVID-19 deaths, cases, and hospitalizations at national, state, and county levels.',
//     dataSources: {
//       origin: 'Centers for Disease Control and Prevention, COVID-19 Response.',
//       timeframe: 'January 2020 - Current',
//       geographicLevel: 'National, State, County',
//       demographicGranularity: 'Race/ethnicity, age, sex',
//       dataCollection: {
//         updateFrequency: 'Monthly',
//         sourceWebsite: 'data.cdc.gov',
//       },
//       notes:
//         'The last case data included is two (2) weeks before the most recent release from the CDC. Data is presented as rates calculated with the American Community Survey (ACS) 2019 5-year estimates.',
//     },
//     // ... (Similar structure for the other datasets)
//   },
// ]

// const DatasetTable = () => {
//   return (
//     <table>
//       <thead>
//         <tr>
//           <th>Title</th>
//           <th>Introduction</th>
//           <th>Origin</th>
//           <th>Timeframe</th>
//           <th>Geographic Level</th>
//           <th>Demographic Granularity</th>
//           <th>Update Frequency</th>
//           <th>Source Website</th>
//           <th>Notes</th>
//         </tr>
//       </thead>
//       <tbody>
//         {datasources.map((datasource) => (
//           <tr key={datasource.title}>
//             <td>{datasource.title}</td>
//             <td>{datasource.introduction}</td>
//             <td>{datasource.dataSources.origin}</td>
//             <td>{datasource.dataSources.timeframe}</td>
//             <td>{datasource.dataSources.geographicLevel}</td>
//             <td>{datasource.dataSources.demographicGranularity}</td>
//             <td>{datasource.dataSources.dataCollection.updateFrequency}</td>
//             <td>{datasource.dataSources.dataCollection.sourceWebsite}</td>
//             <td>{datasource.dataSources.notes}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   )
// }

// export default DatasetTable
