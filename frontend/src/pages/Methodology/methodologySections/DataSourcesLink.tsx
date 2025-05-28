import HetAddressBlock from '../../../styles/HetComponents/HetAddressBlock'
import HetTerm from '../../../styles/HetComponents/HetTerm'

export default function DataSourcesLink() {
  return (
    <section id='data-sources'>
      <article>
        <title>Data Sources - Health Equity Tracker</title>

        <div>
          <p>
            The Health Equity Tracker is committed to providing accurate,
            transparent, and up-to-date information on documented health
            inequities. This section elaborates on how we acquire, standardize,
            and present our data.
          </p>

          <p>
            All data in the Health Equity Tracker is sourced from reputable and
            public databases, including the Centers for Disease Control and
            Prevention (CDC), U.S Census Bureau, Kaiser Family Foundation, and
            several others. A comprehensive list of our data sources, along with
            relevant details, can be found in our data catalog.
          </p>

          <h2 className='mt-12 font-medium text-title' id='data-collection'>
            Data Collection
          </h2>
          <ul className='list-disc pl-4'>
            <li>
              Methods: Data are retrieved from publicly sourced application
              programming interfaces (APIs) and manual downloads. These methods
              ensure that we have the most recent and relevant data.
            </li>
            <li>
              Quality Assurance: Sources are refreshed upon receiving update
              notifications to ensure data accuracy and timeliness.
            </li>
          </ul>

          <h2 className='mt-12 font-medium text-title' id='data-processing'>
            Data Processing
          </h2>

          <ul className='list-disc pl-4'>
            <li>
              Cleaning: We process raw data to remove any inconsistencies,
              duplicates, or irrelevant information.
            </li>
            <li>
              Transformation: Graphic visualizations reflect{' '}
              <HetTerm>crude rates</HetTerm> (non-age-adjusted) presented in
              various formats, such as <HetTerm>cases per 100k</HetTerm>,{' '}
              <HetTerm>percent rate</HetTerm>, <HetTerm>percent share</HetTerm>,
              or as an <HetTerm>index score</HetTerm>.
            </li>
            <li>
              Integration: Where data are available, we calculate age-adjusted
              ratios. These ratios help illustrate the disproportionate impact
              of morbidity and mortality among different races and ethnic groups
              in the U.S. compared to the white (non-Hispanic) population.
            </li>
          </ul>

          <h2
            className='mt-12 font-medium text-title'
            id='visualization-techniques'
          >
            Visualization Techniques
          </h2>
          <p>
            The Health Equity Tracker employs a range of visualization
            techniques to present data in an intuitive and user-friendly manner.
            This includes charts, graphs, and interactive visualizations
            tailored to the specific type of data being presented.
          </p>

          <h2 className='mt-12 font-medium text-title' id='dataset-limitations'>
            Dataset Limitations
          </h2>
          <p>
            While we strive for accuracy, some datasets may have inherent
            limitations, including gaps, potential biases, or uncertainties. We
            transparently communicate these limitations whenever relevant.
          </p>

          <h2
            className='mt-12 font-medium text-title'
            id='updates-and-revisions'
          >
            Updates and Revisions
          </h2>
          <p>
            Data sources are continuously monitored for updates. The Health
            Equity Tracker ensures that all visualizations and datasets are
            refreshed in line with the latest available data.
          </p>

          <h2
            className='mt-12 font-medium text-title'
            id='stakeholder-engagement'
          >
            Stakeholder Engagement
          </h2>
          <p>
            We value the input of various stakeholders, including health
            professionals, community leaders, and the general public, in shaping
            the content and presentation of our tracker.
          </p>

          <h2
            className='mt-12 font-medium text-title'
            id='references-and-citations'
          >
            References and Citations
          </h2>
          <p>
            The entire Health Equity Tracker codebase is publicly available and
            open-source; contributions are welcome via{' '}
            <a
              href='https://github.com/SatcherInstitute/health-equity-tracker'
              target='_blank'
              rel='noreferrer'
            >
              Github
            </a>
            . The Health Equity Tracker is a testament to our commitment to
            promoting health equity and justice. We believe in the power of data
            to drive positive change, and we invite the community to engage with
            our open-source platform. For any queries, feedback, or suggestions
            regarding our data acquisition and presentation, please{' '}
            <a href='https://healthequitytracker.org/contact'>contact us</a>.
          </p>

          <h2 className='mt-12 font-medium text-title' id='contact-information'>
            Contact Information
          </h2>
          <div className='flex w-full flex-col items-center'>
            <HetAddressBlock className='flex w-10/12 flex-col rounded-lg bg-standard-info px-10 py-5' />
          </div>
        </div>
      </article>
    </section>
  )
}
