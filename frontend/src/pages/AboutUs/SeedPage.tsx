import SeedLogo from '../../assets/icons/seedling-256w.webp'
import GoalListItem from './GoalListItem'

export default function SeedPage() {
  return (
    <>
      <title>About the SEED Program - Health Equity Tracker</title>
      <section className='mx-auto flex w-svw max-w-lgplus flex-col justify-center px-8 py-16'>
        <header>
          <img src={SeedLogo} alt='SEED logo' className='mx-auto max-h-24' />
          <h1 className='my-8 font-bold font-sans-title text-alt-green text-big-header leading-normal'>
            About the SEED Program
          </h1>
        </header>

        <section className='mx-auto mb-8 flex max-w-md flex-col items-center'>
          <h2 className='pt-8 pb-4 font-medium font-sans-title text-small-header'>
            Software Engineering and Education Development (SEED) Program
          </h2>
          <h3 className='text-left font-sans-title text-smallest-header leading-some-more-space'>
            Building Technology Careers While Advancing Health Equity
          </h3>
          <p className='text-left'>
            The Health Equity Tracker's{' '}
            <strong>
              Software Engineering and Education Development (SEED) Program
            </strong>{' '}
            creates pathways into technology careers for individuals from
            underrepresented backgrounds while addressing critical health
            disparities through data and design. Housed at Morehouse School of
            Medicine's Satcher Health Leadership Institute, SEED bridges MSM's
            50-year legacy in health equity with modern technology development.
            Participants contribute to the award-winning Health Equity
            Tracker—an open-source platform developed in collaboration with
            Google.org—while gaining hands-on experience with industry-standard
            tools including Google Cloud Platform, TypeScript, React, and
            Python.
          </p>

          <h2 className='pt-8 pb-4 font-medium font-sans-title text-small-header'>
            Our Approach
          </h2>
          <p className='text-left'>
            SEED operates at the intersection of public health and technology,
            emphasizing <strong>coding through a social justice lens</strong>.
            Over six months, participants work flexibly (5-15 hours per week)
            alongside experienced mentors, progressing through three phases:
          </p>

          <ul className='my-8 flex list-none flex-wrap pl-0'>
            <GoalListItem
              title='Frontend Development'
              text='Learning inclusive design principles through QA work and resolving established issues'
            />
            <GoalListItem
              title='Backend Data Engineering'
              text={`Building data pipelines in collaboration with SHLI's public health experts to ensure scientific accuracy and cultural sensitivity`}
            />
            <GoalListItem
              title='Full-Stack Feature Deployment'
              text='Publishing user-facing tools that communicate health equity data to diverse audiences'
            />
          </ul>
          <p className='text-left'>
            Through personalized mentorship, pair programming, and collaborative
            development practices, participants build professional portfolios
            while creating real-world impact. Past participants have added
            maternal mortality as an explorable data topic in the Health Equity
            Tracker's capabilities—a tool now used by community advocates,
            educators, journalists, and policymakers nationwide.
          </p>
          <h2 className='pt-8 pb-4 font-medium font-sans-title text-small-header'>
            Who We Welcome
          </h2>
          <p className='text-left'>
            While our program has primarily trained software engineers,{' '}
            <strong>
              we recognize that advancing health equity requires diverse
              perspectives and skill sets
            </strong>
            . We welcome individuals from various backgrounds who are passionate
            about using their talents to address health disparities:
          </p>
          <ul className='mx-16 my-8 list-disc pl-4 text-left'>
            <li>
              <strong>Aspiring developers</strong> from non-traditional
              backgrounds and career changers
            </li>
            <li>
              <strong>Students and professionals</strong> in public health,
              policy, law, design, data science, and related fields
            </li>
            <li>
              <strong>Community advocates</strong> interested in learning how
              technology can amplify their work
            </li>
            <li>
              <strong>Anyone committed</strong> to inclusive design and
              equity-centered innovation
            </li>
          </ul>
          <p className='text-left'>
            Whether you're interested in coding, research, user experience,
            communications, policy analysis, or other contributions, there's a
            place for you in building a more equitable health data ecosystem.
          </p>
          <h2 className='pt-8 pb-4 font-medium font-sans-title text-small-header'>
            Our Impact
          </h2>
          <h3 className='mr-auto text-left font-sans-title text-smallest-header leading-some-more-space'>
            Program Outcomes:
          </h3>
          <ul className='mx-16 my-8 list-disc pl-4 text-left'>
            <li>
              Both pilot cohort participants completed the program and received
              employment offers citing their production experience
            </li>
            <li>
              Features developed served over 85,000 annual users in the year
              following feature deployment across community organizations,
              advocacy groups, and policymakers
            </li>
            <li>
              Built a community of contributors including the core engineering
              team and external participants
            </li>
            <li>
              Created sustainable model for capacity-building at the
              intersection of health equity and technology
            </li>
          </ul>
          <p className='text-left'>
            <strong>Real-World Applications:</strong> Our participants' work
            empowers communities of color to advocate with evidence in city
            council presentations, state legislature testimony, and policy
            reform campaigns. The tools they build translate complex health data
            into actionable insights that support prevention strategies,
            resource allocation, and systemic change.
          </p>
          <h3 className='mr-auto text-left font-sans-title text-smallest-header leading-some-more-space'>
            Sustainability and Support
          </h3>
          <p className='text-left'>
            Platform sustainability comes through diversified external funding
            from major foundations, federal agencies, and industry partners.
            This cost-effective approach leverages publicly available codebase
            repositories, open data systems, and cloud-based infrastructure to
            provide unprecedented access to harmonized data and specialized
            research centers.
          </p>
          <h3 className='mr-auto text-left font-sans-title text-smallest-header leading-some-more-space'>
            Funding supports:
          </h3>
          <ul className='mx-16 my-8 list-disc pl-4 text-left'>
            <li>
              Mentorship from our full-time engineering team and public health
              researchers
            </li>
            <li>
              Program infrastructure, coordination, and administrative support
            </li>
            <li>
              Stipends for participants (funding in progress), reducing
              financial barriers and expanding access for individuals from
              diverse socioeconomic backgrounds
            </li>
          </ul>
          <h2 className='pt-8 pb-4 font-medium font-sans-title text-small-header'>
            Join Us
          </h2>
          <p className='text-left'>
            SEED demonstrates that we can address multiple equity challenges
            simultaneously—expanding who gets to build technology while ensuring
            that health data tools serve the communities most impacted by
            disparities. Through mentorship, open-source collaboration, and
            equity-centered design, we're growing a new generation of
            professionals equipped to advance diversity, equity, and inclusion
            across the technology and healthcare sectors.
          </p>
          <p className='mr-auto text-left'>
            Interested in participating or supporting our work? Contact us at{' '}
            <a
              className='no-underline hover:underline'
              href='mailto:info@healthequitytracker.org'
            >
              info@healthequitytracker.org
            </a>
            .
          </p>
        </section>
      </section>
    </>
  )
}
