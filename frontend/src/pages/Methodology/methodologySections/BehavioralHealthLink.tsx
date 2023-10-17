import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { urlMap } from '../../../utils/externalUrls'
import React from 'react';
interface BehavioralHealthData {
  title: string;
  description: string;
  links: Array<{
    label: string;
    url: string;
  }>;
  listItems: string[];
  nestedListItems: Array<{
    main: string;
    sub: string[];
  }>;
}

const behavioralHealthData: BehavioralHealthData = {
  title: "America’s Health Rankings",
  description: "Multiple chronic disease, behavioral health, and social determinants of health in the tracker are sourced from various platforms.",
  links: [
    { label: "America’s Health Rankings (AHR)", url: "urlMap.amr" },
    { label: "Behavioral Risk Factor Surveillance System (BRFSS)", url: "urlMap.cdcBrfss" },
    { label: "CDC WONDER", url: "urlMap.cdcWonder" },
    { label: "US Census", url: "urlMap.censusVoting" },
    { label: "Methodology page of America’s Health Rankings", url: "urlMap.amrMethodology" }
  ],
  listItems: [
    "Because BRFSS is a survey, there are not always enough respondents to provide a statistically meaningful estimate of disease prevalence, especially for smaller and typically marginalized racial groups.",
    "BRFSS data broken down by race and ethnicity is not available at the county level, so the tracker does not display these conditions at the county level either."
  ],
  nestedListItems: [
    {
      main: "All metrics sourced from America’s Health Rankings are calculated based on the rates provided from their downloadable data files:",
      sub: [
        "For most conditions, AHR provides these rates as a percentage, though in some cases they use cases per 100,000.",
        "For COPD, diabetes, frequent mental distress, depression, excessive drinking, asthma, avoided care, and suicide, we source the percent share metrics directly from AHR."
      ]
    }
  ]
};

// const Link: React.FC<{ label: string, url: string }> = ({ label, url }) => (
//   <a href={url}>{label}</a>
// );

// const ListItem: React.FC<{ text: string }> = ({ text }) => (
//   <li>{text}</li>
// );

// const NestedListItem: React.FC<{ main: string, sub: string[] }> = ({ main, sub }) => (
//   <li>
//     {main}
//     <ul>
//       {sub.map((item, index) => (
//         <li key={index}>{item}</li>
//       ))}
//     </ul>
//   </li>
// );

const Link: React.FC<{ label: string, url: string }> = ({ label, url }) => (
  <a href={url}>{label}</a>
);

const ListItem: React.FC<{ text: string }> = ({ text }) => (
  <li>{text}</li>
);

const NestedListItem: React.FC<{ main: string, sub: string[] }> = ({ main, sub }) => (
  <li>
    {main}
    <ul>
      {sub.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </li>
);

const BehavioralHealthLink: React.FC = () => {
  return (
    <section>
      <article>
        <h3 className={styles.MethodologySubsubheaderText}>
          America’s Health Rankings
        </h3>
        <p>
          Multiple chronic disease, behavioral health, and social determinants of health in the tracker are sourced from{' '}
          <Link label="America’s Health Rankings (AHR)" url="urlMap.amr" />, who in turn source the majority of their data from the{' '}
          <Link label="Behavioral Risk Factor Surveillance System (BRFSS)" url="urlMap.cdcBrfss" />, a survey run by the CDC, along with supplemental data from{' '}
          <Link label="CDC WONDER" url="urlMap.cdcWonder" /> and the{' '}
          <Link label="US Census" url="urlMap.censusVoting" />.
        </p>
        <ul>
          <ListItem text="Because BRFSS is a survey, there are not always enough respondents to provide a statistically meaningful estimate of disease prevalence, especially for smaller and typically marginalized racial groups. Please see the methodology page of America’s Health Rankings for details on data suppression." />
          <ListItem text="BRFSS data broken down by race and ethnicity is not available at the county level, so the tracker does not display these conditions at the county level either." />
          <NestedListItem
            main="All metrics sourced from America’s Health Rankings are calculated based on the rates provided from their downloadable data files:"
            sub={[
              "For most conditions, AHR provides these rates as a percentage, though in some cases they use cases per 100,000. If we present the condition using the same units, we simply pass the data along directly. If we need to convert a rate they present as a percent into a per 100k, we multiply their percent amount by 1,000 to obtain the new per 100k rate. 5% (of 100) === 5,000 per 100,000.",
              "For COPD, diabetes, frequent mental distress, depression, excessive drinking, asthma, avoided care, and suicide, we source the percent share metrics directly from AHR."
            ]}
          />
        </ul>
      </article>
    </section>
  );
};

export default BehavioralHealthLink;

// const BehavioralHealthLink: React.FC = () => {
//   const { title, description, links, listItems, nestedListItems } = behavioralHealthData;

//   return (
//     <section>
//       <article>
//         <h3 className={styles.MethodologySubsubheaderText}>
//           {title}
//         </h3>
//         <p>
//           {description}{' '}
//           {links.map((link, index) => (
//             <Link key={index} {...link} />
//           ))}
//         </p>
//         <ul>
//           {listItems.map((item, index) => (
//             <ListItem key={index} text={item} />
//           ))}
//         </ul>
//         <ul>
//           {nestedListItems.map((item, index) => (
//             <NestedListItem key={index} {...item} />
//           ))}
//         </ul>
//       </article>
//     </section>
//   );
// };

// export default BehavioralHealthLink;


// const BehavioralHealthLink = () => {
//   return (
//     <section>
//       <article>
//         <h3 className={styles.MethodologySubsubheaderText}>
//           America’s Health Rankings
//         </h3>
//         <p>
//           Multiple chronic disease, behavioral health, and social determinants
//           of health in the tracker are sourced from{' '}
//           <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>, who in
//           turn source the majority of their data from the{' '}
//           <a href={'urlMap.cdcBrfss'}>
//             Behavioral Risk Factor Surveillance System (BRFSS)
//           </a>
//           , a survey run by the CDC, along with supplemental data from{' '}
//           <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
//           <a href={'urlMap.censusVoting'}>US Census</a>.
//           <a href={urlMap.amr}>America’s Health Rankings (AHR)</a>, who in turn
//           source the majority of their data from the{' '}
//           <a href={urlMap.cdcBrfss}>
//             Behavioral Risk Factor Surveillance System (BRFSS)
//           </a>
//           , a survey run by the CDC, along with supplemental data from{' '}
//           <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{' '}
//           <a href={urlMap.censusVoting}>US Census</a>.
//         </p>
//         <ul>
//           <li>
//             Because BRFSS is a survey, there are not always enough respondents
//             to provide a statistically meaningful estimate of disease
//             prevalence, especially for smaller and typically marginalized racial
//             groups. Please see the{' '}
//             <a href={'urlMap.amrMethodology'}>methodology page</a> of America’s
//             <a href={urlMap.amrMethodology}>methodology page</a> of America’s
//             Health Rankings for details on data suppression.
//           </li>
//           <li>
//             BRFSS data broken down by race and ethnicity is not available at the
//             county level, so the tracker does not display these conditions at
//             the county level either.
//           </li>
//           <li>
//             All metrics sourced from America’s Health Rankings are calculated
//             based on the rates provided from their downloadable data files:
//             <ul>
//               <li>
//                 For most conditions, AHR provides these rates as a percentage,
//                 though in some cases they use cases per 100,000. If we present
//                 the condition using the same units, we simply pass the data
//                 along directly. If we need to convert a rate they present as a{' '}
//                 <b>percent</b> into a <b>per 100k</b>, we multiply their percent
//                 amount by 1,000 to obtain the new per 100k rate.
//                 <code>5% (of 100) === 5,000 per 100,000</code>.
//               </li>
//               <li>
//                 For COPD, diabetes, frequent mental distress, depression,
//                 excessive drinking, asthma, avoided care, and suicide, we source
//                 the <b>percent share</b> metrics directly from AHR.
//               </li>
//             </ul>
//           </li>
//         </ul>
//       </article>
//     </section>
//   )
// }

// export default BehavioralHealthLink
