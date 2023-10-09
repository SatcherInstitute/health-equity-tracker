import { Card } from '@mui/material'
import {
  ALASKA_PRIVATE_JAIL_CAVEAT,
  CombinedIncarcerationStateMessage,
} from '../../../data/providers/IncarcerationProvider'
import styles from '../MethodologyPage.module.scss'
import { MissingCAWPData } from '../methodologyContent/missingDataBlurbs'
<<<<<<< HEAD
<<<<<<< HEAD
import { urlMap } from '../../../utils/externalUrls'
=======
>>>>>>> 25282a78 (fixing branch conflicts)
=======
import { urlMap } from '../../../utils/externalUrls'
>>>>>>> ece76097 (updated links)

const PdohLink = () => {
  return (
    <section>
      <article>
        <h1 className={styles.MethodologyQuestion}>
          Political Determinants of Health
        </h1>
<<<<<<< HEAD
<<<<<<< HEAD
        <h3 id="#incarceration" className={styles.MethodologySubsubheaderText}>
=======
        <h3 id="incarceration" className={styles.MethodologySubsubheaderText}>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
        <h3 id="#incarceration" className={styles.MethodologySubsubheaderText}>
>>>>>>> ece76097 (updated links)
          Incarceration
        </h3>

        <Card elevation={3} className={styles.WhyBox}>
          <p>
            Incarceration is influenced by a blend of political forces, laws,
            and public opinion. Laws that govern sentencing policies and
            disenfranchisement of convicted felons are some of the political
            forces that determine voter participation in the justice-involved
            population.
          </p>
          <p>
            The ability to vote has been described as{' '}
<<<<<<< HEAD
<<<<<<< HEAD
            <a href={urlMap.repJohnLewisTweet}>
=======
            <a href={'urlMap.repJohnLewisTweet'}>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
            <a href={urlMap.repJohnLewisTweet}>
>>>>>>> ece76097 (updated links)
              the singular most powerful, non-violent tool in American democracy
            </a>
            . As of 2020, an estimated 5.17 million people were disenfranchised
            because of a prior felony conviction with minority populations of
            voting age being disproportionately represented.{' '}
<<<<<<< HEAD
<<<<<<< HEAD
            <a href={urlMap.deniedVoting}>(Sentencing Project)</a>
          </p>
          <p>
            <a href={urlMap.aafp}>Studies have also shown</a> that incarceration
            increases the prevalence of chronic health conditions, infectious
            diseases such as HIV/ AIDS, mental illnesses and substance use
            disorders. Incarceration has also been{' '}
            <a href={urlMap.rwjf}>
=======
            <a href={'urlMap.deniedVoting'}>(Sentencing Project)</a>
          </p>
          <p>
            <a href={'urlMap.aafp'}>Studies have also shown</a> that
            incarceration increases the prevalence of chronic health conditions,
            infectious diseases such as HIV/ AIDS, mental illnesses and
            substance use disorders. Incarceration has also been{' '}
            <a href={'urlMap.rwjf'}>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
            <a href={urlMap.deniedVoting}>(Sentencing Project)</a>
          </p>
          <p>
            <a href={urlMap.aafp}>Studies have also shown</a> that incarceration
            increases the prevalence of chronic health conditions, infectious
            diseases such as HIV/ AIDS, mental illnesses and substance use
            disorders. Incarceration has also been{' '}
            <a href={urlMap.rwjf}>
>>>>>>> ece76097 (updated links)
              shown to cause a reduction in life expectancy
            </a>
            , with each year spent in prison corresponding to 2 years of reduced
            life expectancy.
          </p>
          <p>
            The impact of incarceration on the health of the justice involved
            lingers long after the period of incarceration is over. Upon reentry
            into society, the lack of adequate access to healthcare and the
            resources that engender health such as health insurance coverage,
            housing, employment, the lack of opportunities for upward
            advancement etc. further exacerbates the health inequities
            experienced by this group.
          </p>
        </Card>

        <p>
          <b>Data Sources</b>
        </p>

        <p>
          The Bureau of Justice Statistic (BJS) releases a variety of reports on
          people under correctional control; by combining tables from two of
<<<<<<< HEAD
<<<<<<< HEAD
          these reports (<a href={urlMap.bjsPrisoners}>“Prisoners in 2020”</a>{' '}
          and <a href={urlMap.bjsCensusOfJails}>“Census of Jails 2005-2019”</a>
          ), we are able to generate reports on individuals (including children)
          incarcerated in <b>Prison</b> and <b>Jail</b> in the United States at
          a national, state, and territory level. Additionally, the{' '}
          <a href={urlMap.veraGithub}>Vera Institute for Justice</a> has done
=======
          these reports (<a href={'urlMap.bjsPrisoners'}>“Prisoners in 2020”</a>{' '}
          and{' '}
          <a href={'urlMap.bjsCensusOfJails'}>“Census of Jails 2005-2019”</a>
          ), we are able to generate reports on individuals (including children)
          incarcerated in <b>Prison</b> and <b>Jail</b> in the United States at
          a national, state, and territory level. Additionally, the{' '}
          <a href={'urlMap.veraGithub'}>Vera Institute for Justice</a> has done
>>>>>>> 25282a78 (fixing branch conflicts)
=======
          these reports (<a href={urlMap.bjsPrisoners}>“Prisoners in 2020”</a>{' '}
          and <a href={urlMap.bjsCensusOfJails}>“Census of Jails 2005-2019”</a>
          ), we are able to generate reports on individuals (including children)
          incarcerated in <b>Prison</b> and <b>Jail</b> in the United States at
          a national, state, and territory level. Additionally, the{' '}
          <a href={urlMap.veraGithub}>Vera Institute for Justice</a> has done
>>>>>>> ece76097 (updated links)
          extensive research and analysis of the BJS and other data sources to
          provide county level jail and prison incarceration rates.
        </p>

        <ul>
          <li>
            <b>National by Age:</b> Prisoners Table 10
          </li>

          <li>
            <b>State by Age:</b> Prisoners Table 2 (totals only)
          </li>

          <li>
            <b>National by Race:</b> Prisoners Appendix Table 2
          </li>

          <li>
            <b>State by Race:</b> Prisoners Appendix Table 2
          </li>

          <li>
            <b>National by Sex:</b> Prisoners Table 2
          </li>

          <li>
            <b>State by Sex:</b> Prisoners Table 2
          </li>
          <li>
            <b>All State and National Reports:</b> Prisoners Table 13 (children
            in prison alert)
          </li>
          <li>
            <b>All Territories:</b> Prisoners Table 23 (totals only)
          </li>
          <li>
            <b>All County Reports:</b> Vera Incarceration Trends
          </li>
        </ul>

<<<<<<< HEAD
<<<<<<< HEAD
        <h3 id="#jail" className={styles.MethodologySubsubheaderText}>
          Jail
        </h3>
=======
        <p>
          <b>Jail</b>
        </p>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
        <h3 id="#jail" className={styles.MethodologySubsubheaderText}>
          Jail
        </h3>
>>>>>>> ece76097 (updated links)

        <p>
          Jail includes all individuals currently confined by a local, adult
          jail facility, but does not include individuals who are supervised
          outside of jail or who report only on weekends. In general, jail
          facilities incarcerate individuals who are awaiting trial or
          sentencing, or who are sentenced to less than 1 year.
        </p>

        <ul>
          <li>
            County reports: Vera data, which we use for our county level
            reports, restricts both the measured jail population and the
            relevant total population to individuals aged <b>15-64</b>.
          </li>
        </ul>

<<<<<<< HEAD
<<<<<<< HEAD
        <h3 id="#prison" className={styles.MethodologySubsubheaderText}>
          Prison
        </h3>
=======
        <p>
          <b>Prison</b>
        </p>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
        <h3 id="#prison" className={styles.MethodologySubsubheaderText}>
          Prison
        </h3>
>>>>>>> ece76097 (updated links)

        <p>
          In general, prisons incarcerate individuals who have been sentenced to
          more than 1 year, though in many cases prison can have jurisdictional
          control of an individual who is confined in a jail facility. Due to
          this overlap, we are currently unable to present accurate rates of
          combined incarceration.
        </p>

        <p>
          Jurisdiction refers to the legal authority of state or federal
          correctional officials over a incarcerated person, regardless of where
          they are held. Our ‘Sex’ and ‘Race’ reports present this
          jurisdictional population, while our ‘Age’ reports (due to the
          limitations in the data provided by BJS) only display the{' '}
          <b>sentenced</b> jurisdictional population.{' '}
        </p>

        <p>
          Data presented for prison differs slightly by geographic level and by
          data type:
        </p>

        <ul>
          <li>
            National report: Prison includes all individuals under the
            jurisdiction of a state or federal adult prison facility in the
            United States, but not inclusive of territorial, military, or Indian
            Country facilities. This data is disaggregated by race/ethnicity,
            age, and sex.
          </li>

          <li>
            State reports: Prison includes all individuals including under the
            jurisdiction of that state’s adult prison facilities. This data is
            disaggregated by race/ethnicity and sex, however the BJS Prisoners
            report does not provide age disaggregation to the state level.
          </li>
          <li>
            Territory reports: All individuals under the jurisdiction of that
            territory’s adult prison facilities. Because <b>American Samoa</b>{' '}
            did not report a value for jurisdictional population, we have used
            their value for custodial population instead. This data is not
            disaggregated by any demographic breakdown. All incarcerated people
            in the U.S. territories are counted under <b>Prison</b>.
          </li>
          <li>
            County reports: All individuals under the under the jurisdiction of
            a state prison system on charges arising from a criminal case in a
            specific county.
          </li>
        </ul>

        <p>
          The race/ethnicity breakdowns provided match those used in the ACS
          population source, however we do combine the BJS’s{' '}
          <b>Did not report</b> race values into our <b>Unknown</b> race group.{' '}
        </p>

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ece76097 (updated links)
        <h3
          id="#children-in-adult-facilities"
          className={styles.MethodologySubsubheaderText}
        >
          Children in Adult Facilities
        </h3>

<<<<<<< HEAD
=======
        <p>
          <b>Children in Adult Facilities</b>
        </p>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
>>>>>>> ece76097 (updated links)
        <p>
          When presenting incarceration reports, we have chosen to highlight the
          total number of confined children (in adult facilities), rather than
          only including this information as our standard “per 100k” rate. This
          decision was based on several factors:
        </p>

        <ul>
          <li>
            The lack of federal law regarding the maximum age of juvenile court
            jurisdiction and transfer to adult courts coupled with the variance
            in state-specific laws makes it unfeasible to derive an accurate
            population base for individuals that may be incarcerated in an adult
            prison or jail facility. Because of this, any rate calculations for{' '}
            <b>0-17</b> are comparing the <b>number of prisoners under 18</b>{' '}
            proportional to the entire population of children down to newborns,
            resulting in a diluted incidence rate. This can be seen on national
            and state-level jail reports, as BJS provides these figures
            directly. In other reports, we have chosen not to calculate the
            incidence rate and instead rely on the total number of confined
            children to highlight this health inequity.
          </li>
          <li>
            The prison numbers presented in the BJS Prisoners 2020 report for
            juveniles include <b>confined</b> population (literally held within
            a specific facility), as opposed to the other prison reports which
            present the <b>jurisdictional</b> population (under the control of a
            facility but potentially confined elsewhere).
          </li>
        </ul>

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ece76097 (updated links)
        <h3
          id="#combined-systems"
          className={styles.MethodologySubsubheaderText}
        >
          Combined Systems
        </h3>
<<<<<<< HEAD
=======
        <p>
          <b>Combined Systems</b>
        </p>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
>>>>>>> ece76097 (updated links)

        <p>
          {CombinedIncarcerationStateMessage()} {ALASKA_PRIVATE_JAIL_CAVEAT}
        </p>

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ece76097 (updated links)
        <h3 id="#women-in-gov" className={styles.MethodologySubsubheaderText}>
          Women in legislative office
        </h3>

        <Card elevation={3} className={styles.WhyBox}>
          <a href={urlMap.doi1}>A link has been established</a> between having
          women in government and improvements in population health.{' '}
          <a href={urlMap.doi2}>Women in legislative office</a> have been shown
          to <a href={urlMap.doi3}>advocate for policies</a> that pertain to
          some of the crucial social and political determinants of health that
          impact the overall health of our nation such as education, poverty,
          social welfare, reproductive and maternal health, children, and family
          life. These policies in turn play a significant role in the
          advancement of health equity for all.
        </Card>

<<<<<<< HEAD
        <p>
          By leveraging data from the{' '}
          <a href={urlMap.cawp}>Center for American Women in Politics (CAWP)</a>{' '}
=======
        <h3 className={styles.MethodologySubsubheaderText}>Visualizations</h3>
        <p>
          Please consider the impact of under-reporting and data gaps when
          exploring the visualizations. These issues may lead to incorrect
          conclusions, e.g. low rates in a given location may be due to
          under-reporting rather than absence of impact.
        </p>
        <p>
          By leveraging data from the{' '}
          <a href={'urlMap.cawp'}>
            Center for American Women in Politics (CAWP)
          </a>{' '}
>>>>>>> 25282a78 (fixing branch conflicts)
=======
        <p>
          By leveraging data from the{' '}
          <a href={urlMap.cawp}>Center for American Women in Politics (CAWP)</a>{' '}
>>>>>>> ece76097 (updated links)
          we are able to present two primary metrics on these reports:
        </p>
        <ul>
          <li>
            The intersectional representation (e.g.{' '}
            <i>
              “What percent of all Georgia state legislators are black women?”
            </i>
            ).{' '}
          </li>
          <li>
            The race/ethnicity distribution amongst women legislators (e.g.{' '}
            <i>
              “What percent of the women in the Georgia State Legislature are
              black?“
            </i>
            ){' '}
          </li>
        </ul>

        <p>
          These metrics are calculated for two distinct data types:{' '}
          <b>Women in State Legislature</b> and <b>Women in U.S. Congress</b>,
          and both of these data types are available at the state, territory,
          and national levels. Our percentage calculations at the national level
          specifically include legislators from the U.S. territories, which can
          result in slightly different results than those presented on the CAWP
          website. All gender and race/ethnicity categorizations are
          self-reported, and a legislator may be represented in multiple race
          groupings if that is how they identify.
        </p>

        <p>
          We are also able to track these rates over time as outlined below. A
          member is counted towards the numerator any year in which they served
          even a single day, and similarly counted towards the denominator for
          U.S. Congress total counts. This results in the "bumpiness" observed
          as the proportions change incrementally with more persons serving per
          year than there are available seats. For state legislators, the
          denominators total counts simply represent the number of seats
          available, and do not fluctuate with election turnover. While we can
          track U.S. Congress back to just before the first woman was elected to
          the U.S. Congress in 1917, we can only track representation in state
          legislators back to 1983, as that is the furthest back that our data
          sources reliably provide the denominator used of total state
          legislators count, per year, per state.
        </p>
        <ul>
          <li>
            Historical, intersectional representation (e.g.{' '}
            <i>
              “In each year since 1915, what percent of all U.S. Congress
              members identified as black women?”
            </i>
            ). We obtain the historical counts of U.S. Congress members, by year
            and by state/territory, from the open-source{' '}
<<<<<<< HEAD
<<<<<<< HEAD
            <a href={urlMap.unitedStatesIo}>@unitedstates project</a>.
=======
            <a href={'urlMap.unitedStatesIo'}>@unitedstates project</a>.
>>>>>>> 25282a78 (fixing branch conflicts)
=======
            <a href={urlMap.unitedStatesIo}>@unitedstates project</a>.
>>>>>>> ece76097 (updated links)
          </li>
          <li>
            Historical relative inequity (e.g.{' '}
            <i>
              “In each year since 2019, what percent over- or under-represented
              were black women when compared to their share of represention
              amongst all women Congress members?”
            </i>
            ) Note: we currently track this measure back only to 2019, as we are
            utilizing the 2019 ACS 5-year estimates for the population
            comparison metric.{' '}
          </li>
        </ul>

        <p>
          Unfortunately CAWP and the U.S. Census use some different
          race/ethnicity groupings, making direct comparisons and calculations
          difficult or impossible in some cases. For specific methodology on the
          race groups collected by CAWP, please{' '}
<<<<<<< HEAD
<<<<<<< HEAD
          <a href={urlMap.cawp}>visit their database directly</a> . We have made
          several adjustments to our methods to incorporate these non-standard
          race groupings when possible:
=======
          <a href={'urlMap.cawp'}>visit their database directly</a> . We have
          made several adjustments to our methods to incorporate these
          non-standard race groupings when possible:
>>>>>>> 25282a78 (fixing branch conflicts)
=======
          <a href={urlMap.cawp}>visit their database directly</a> . We have made
          several adjustments to our methods to incorporate these non-standard
          race groupings when possible:
>>>>>>> ece76097 (updated links)
        </p>

        <ul>
          <li>
            Women who identify as multiple specific races are listed multiple
            times in each corresponding race visualization. Therefore, these
            race/ethnicity groupings are non-exclusive, and cannot be summed.
            Additionally, a small number of women identify as the specific race
            label <b>Multiracial Alone</b>, without specifying the multiple
            races with which they identify. Both of these multiple-race groups
            are combined into our <b>Women of two or more races</b> group.
          </li>
          <li>
            The composite race group{' '}
            <b>American Indian, Alaska Native, Asian & Pacific Islander</b> is
            our best attempt to visualize the impact to these under-represented
            groups; to accurately compare against available population data from
            the U.S. Census we must further combine these distinct racial
            identities.
          </li>
          <li>
            There is currently no population data collected by the U.S. Census
            for <b>Middle Eastern & North African</b>, although this data equity
            issue has seen{' '}
<<<<<<< HEAD
<<<<<<< HEAD
            <a href={urlMap.senateMENA} rel="noreferrer" target="_blank">
=======
            <a href={'urlMap.senateMENA'} rel="noreferrer" target="_blank">
>>>>>>> 25282a78 (fixing branch conflicts)
=======
            <a href={urlMap.senateMENA} rel="noreferrer" target="_blank">
>>>>>>> ece76097 (updated links)
              some progress
            </a>{' '}
            in recent decades. Currently, <b>MENA</b> individuals are counted by
            the ACS as <b>White</b>.
          </li>
        </ul>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ece76097 (updated links)
        <Card
          id={'#women-in-gov-missing-and-suppressed-data'}
          elevation={3}
          className={styles.MissingDataBox}
        >
<<<<<<< HEAD
=======
        <Card elevation={3} className={styles.MissingDataBox}>
>>>>>>> 25282a78 (fixing branch conflicts)
=======
>>>>>>> ece76097 (updated links)
          <MissingCAWPData />
        </Card>
      </article>
    </section>
  )
}

export default PdohLink
