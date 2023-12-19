import { Link } from 'react-router-dom'
import {
  EXPLORE_DATA_PAGE_LINK,
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_HIV_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
} from '../../../utils/internalRoutes'
import {
  type AgeAdjustmentConfig,
  type TableOperationsKeys,
  type TableCalculation,
  type TableData,
  type AgeInfo,
  type AgeAdjustTableConfig,
  DataSourcingConfig,
  AlgorithmConfig,
  TableOperationsTypes,
  exampleTableConfig,
  ageSpecificTableConfig,
  standardPopulationTableConfig,
  expectedProductTableConfig,
  expectedSumTableConfig,
  deathRatioTableConfig,
} from '../methodologyContent/AgeAdjustmentContent'

export const AgeAdjustmentIntro = () => (
  <>
    <p>
      We have decided to present <b>age-adjusted ratios</b> when possible in
      order to show a more accurate and equitable view of the impact on
      non-White communities in the United States.
    </p>
    <p>
      As of{' '}
      {new Date().toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      })}
      {', '}we are able to calculate these age-adjusted ratios for{' '}
      <Link to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}>
        HIV deaths
      </Link>
      {', '}
      <Link to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_DEATHS_US_SETTING}>
        COVID-19 deaths
      </Link>
      {' and '}
      <Link to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_HOSP_US_SETTING}>
        COVID-19 hospitalizations
      </Link>
      , and we present the findings in a distinct, age-adjusted table. All of
      the other data shown on the tracker, including visualizations across all
      topics, are not age-adjusted, or ‘crude rates’. Showing non-adjusted data
      can mask disparities, and we are working to expand our analysis to provide
      a more equitable view of the impact to racial and ethnic minorities.
    </p>
    <p>
      We use a <b>direct standardization method</b>, with the{' '}
      <b>internal standard population</b> for each state being that state's
      total population. Finally, the ratios we present for each race group is
      that race's age-adjusted count, divided by the age-adjusted count for
      White, non-Hispanic individuals in the same location. Thus, our
      age-adjusted ratios can only be used to compare race groups within each
      state, and <b>not</b> to compare race groups between states. For COVID-19
      reports, we source the standard population numbers from the 2019
      population numbers from{' '}
      <a href='https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html'>
        County Population by Characteristics
      </a>
      . For HIV reports, the population data is provided along with the
      condition rates from the same{' '}
      <a href='https://gis.cdc.gov/grasp/nchhstpatlas/tables.html'>
        CDC Atlas data tables
      </a>
      .
    </p>
  </>
)

export const DataSourcingSection = () => (
  <>
    <AgeAdjustmentTitle
      title='Data Sourcing'
      subtitle='In order to do an age-adjustment, we needed the following pieces of
        information:
      </p>'
    />
    <AgeAdjustmentList config={DataSourcingConfig} />
  </>
)

export const AlgorithmSection = () => (
  <>
    <AgeAdjustmentTitle
      title='Algorithm'
      subtitle='How we calculate age-adjusted ratios'
    />
    <AgeAdjustmentList config={AlgorithmConfig} />
  </>
)

export const ExampleTable = () => (
  <>
    <h3 className='text-left font-serif text-smallestHeader font-light text-alt-black'>
      Age-Adjustment Example: HIV Deaths
    </h3>
    <p>
      Here is an example of a single state with two races, <b>Race A</b> and{' '}
      <b>Race B</b>, with three age breakdowns: <b>0-29</b>, <b>30-59</b>, and{' '}
      <b>60+</b>. <b>Race A</b> will be the race we divide against to obtain our
      ratios (like <b>White, Non-Hispanic</b>), and <b>Race B</b> is any other
      race group.
    </p>

    <AgeAdjustmentTable config={exampleTableConfig} />
  </>
)

export const AgeSpecificTableConfig = () => (
  <>
    <h4 className='mt-20 font-sansText text-text font-medium'>
      1) Calculate the <b>age-specific HIV death rates</b> which will be each
      race/age group's death count divided by its population.
    </h4>

    <AgeAdjustmentTable config={ageSpecificTableConfig} />
  </>
)

export const StandardPopulationTable = () => (
  <>
    <h4 className='mt-20 font-sansText text-text font-medium'>
      2) Get the <b>standard population</b> per age group, which will be the
      summed population of all race/age groups within that age group.
    </h4>

    <AgeAdjustmentTable config={standardPopulationTableConfig} />
  </>
)

export const ExpectedProductTable = () => (
  <>
    <h4 className='mt-20 font-sansText text-text font-medium'>
      3) Calculate the expected deaths for each age/race group:
    </h4>
    <p>As noted above, the formula for each row is:</p>
    <StyledPreTag>
      (HIV Deaths / Population) X Standard Population for Corresponding Age
      Group
    </StyledPreTag>
    <AgeAdjustmentTable config={expectedProductTableConfig} />
  </>
)

export const ExpectedSumTable = () => (
  <>
    <h4 className='mt-20 font-sansText text-text font-medium'>
      4) For each race, we sum together the expected HIV deaths from each of its
      age groups to calculate the total expected HIV deaths for that race:
    </h4>
    <AgeAdjustmentTable config={expectedSumTableConfig} />
  </>
)

export const DeathRatioTable = () => (
  <>
    <h4 className='mt-20 font-sansText text-text font-medium'>
      5) Calculate the age-adjusted death ratio:
    </h4>
    <AgeAdjustmentTable config={deathRatioTableConfig} />
  </>
)

// // // RESUABLE, STYLED COMPONENTS AND HELPERS BELOW, MOVE?

const AgeAdjustmentTitle = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <>
    <h4 className='mt-20 font-sansText text-text font-medium'>{title}</h4>
    <p>{subtitle}</p>
  </>
)

const AgeAdjustmentList = ({ config }: { config: AgeAdjustmentConfig[] }) => (
  <>
    <ol>
      {config.map((o, i) => (
        <li key={o.topic}>
          <p>
            <b>{o.topic}</b>
          </p>
          {o.subList && (
            <ul>
              {o.subList.map((subItem, subIndex) => (
                <li key={subIndex}>{subItem.subDescription}</li>
              ))}
            </ul>
          )}
          {o.description && <p>{o.description}</p>}
          {o.snippet && <StyledPreTag>{o.snippet}</StyledPreTag>}
        </li>
      ))}
    </ol>
  </>
)

const operations = {
  divide: (operands: number[]) => operands.reduce((acc, val) => acc / val),
  multiply: (operands: number[]) => operands.reduce((acc, val) => acc * val),
  add: (operands: number[]) => operands.reduce((acc, val) => acc + val),
}

const performOperation = (
  operation: TableOperationsKeys,
  operands: number[]
) => {
  return operations[operation] ? operations[operation](operands) : 0
}

const localeOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
}
const tableCalculationData = (data: TableCalculation) => {
  const operator = TableOperationsTypes[data.operation]
  const formattedOperands = data.operands
    .map((op) => op.toLocaleString(undefined, localeOptions))
    .join(` ${operator} `)
  const result = parseFloat(
    performOperation(data.operation, data.operands).toFixed(8)
  ).toLocaleString(undefined, {
    minimumFractionDigits: data?.resultOptions?.minDigit ?? 0,
    maximumFractionDigits: data?.resultOptions?.maxDigit ?? 8,
  })
  return { result, formattedOperands }
}

// type guards to check for data type in config objects
const isTableCalculation = (data: TableData): data is TableCalculation => {
  return typeof data === 'object' && data !== null && 'operation' in data
}
const isAgeInfo = (data: TableData): data is AgeInfo => {
  return typeof data === 'object' && data !== null && 'age' in data
}

const renderTableCell = (data: TableData, index: number) => {
  if (isAgeInfo(data)) {
    return (
      <StyledTableData key={index}>
        <div className='text-smallest italic'>{data.age}</div>
        {data.value.toLocaleString()}
      </StyledTableData>
    )
  } else if (isTableCalculation(data)) {
    const { result, formattedOperands } = tableCalculationData(data)
    return (
      <StyledTableData key={index}>
        <div className='text-smallest italic'>{formattedOperands}</div>
        <b>
          {' '}
          = {result}
          {data.appendSymbol ?? ''}
        </b>
      </StyledTableData>
    )
  } else {
    return <StyledTableData key={index}>{data}</StyledTableData>
  }
}

export const AgeAdjustmentTable = ({
  config,
}: {
  config: AgeAdjustTableConfig
}) => (
  <table className='m-4 border-collapse border-solid border-bg-color p-1'>
    <thead className='font-bold'>
      <tr className='bg-join-effort-bg1'>
        {config.head.map((h) => (
          <StyledTableData key={h}>{h}</StyledTableData>
        ))}
      </tr>
    </thead>
    <tbody>
      {config.body.map((row, i) => (
        <tr key={i} className='odd:bg-white even:bg-explore-bg-color'>
          {row.map((data, index) => renderTableCell(data, index))}
        </tr>
      ))}
    </tbody>
  </table>
)

const StyledTableData = ({ children }: { children: React.ReactNode }) => (
  <td className='border-collapse border-solid border-bg-color p-1'>
    {children}
  </td>
)

const StyledPreTag = ({ children }: { children: React.ReactNode }) => (
  <pre className='mx-1 mb-8 mt-1 overflow-x-auto whitespace-pre-wrap break-words border-solid border-bg-color bg-explore-bg-color p-1 text-smallest'>
    {children}
  </pre>
)
