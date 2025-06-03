import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import { dataVisuals } from '../policyContent/HowToUseTheDataContent'

export default function HowToUseTheDataTab() {
  return (
    <div className='mx-0 w-full max-w-svw px-0'>
      <title>How To Use The Data - Health Equity Tracker</title>
      <section
        id='het-data-visualizations'
        className='mx-0 w-fit max-w-svw px-0'
      >
        <h1 className='sr-only'>How to Use the Data</h1>
        <HetOverline text='How to Use the Data' />
        <h2 className='my-0 font-medium text-alt-green text-title'>
          HET Data Visualization Maps and Charts
        </h2>
        <p>
          In Atlanta, as in many cities, gun violence remains a pressing issue,
          disproportionately affecting marginalized communities. The open-source
          Health Equity Tracker provides vital data that can empower residents
          to advocate for meaningful policy changes. By understanding and
          utilizing this tool, community members can create compelling
          visualizations to highlight the need for reform. This guide offers
          straightforward instructions on how to use various data visualizations
          effectively.
        </p>
      </section>
      {dataVisuals.map((dataVisual) => {
        return (
          <section
            key={dataVisual.sectionId}
            id={dataVisual.sectionId}
            className='mx-0 w-auto max-w-svw px-0'
          >
            <div className='w-auto max-w-svw'>
              <HetOverline text='Our Data Visuals' />

              <h2 className='my-0 font-medium text-alt-green text-title'>
                {dataVisual.title}
              </h2>

              <div className='w-auto max-w-svw py-4 sm:m-0 sm:p-0'>
                <p>{dataVisual.description}</p>
              </div>

              <div>
                <ul className='grid list-none grid-cols-2 gap-4 p-0 text-smallest'>
                  {dataVisual.details.alternateBreakdowns !== 'N/A' && (
                    <li className='flex flex-col'>
                      <p className='my-0 font-semibold text-alt-green'>
                        Alternate Disparities Breakdowns
                      </p>
                      <p className='my-0'>
                        {Array.isArray(dataVisual.details.alternateBreakdowns)
                          ? dataVisual.details.alternateBreakdowns.join(', ')
                          : dataVisual.details.alternateBreakdowns}
                      </p>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h2 className='mt-4 mb-2 font-medium text-alt-green text-title'>
                  How to Use
                </h2>
                <div>
                  {dataVisual.details.howToUse.map((step, i) => (
                    <p className='my-0 py-0' key={i}>
                      <strong>{step.step}:</strong> {step.description}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h2 className='mt-4 mb-4 font-medium text-alt-green text-title'>
                  Interactive Example
                </h2>
                {dataVisual.customCard}
              </div>

              <div className='mt-8 border border-methodology-green border-x-0 border-t-0 border-b border-solid'></div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
