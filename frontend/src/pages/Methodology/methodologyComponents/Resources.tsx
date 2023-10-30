import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { Grid, Typography } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { type ResourceGroup } from '../../WhatIsHealthEquity/ResourcesData'

interface ResourcesProps {
  resourceGroups: ResourceGroup[]
  id?: string
}

// function Resources({ resourceGroups, id }: ResourcesProps) {
// const halfLength = Math.ceil(resourceGroups.length / 2)
// const firstHalf = resourceGroups.slice(0, halfLength)
// const secondHalf = resourceGroups.slice(halfLength)

function Resources({ resourceGroups, id }: ResourcesProps) {
  const renderResourcesList = (groups: any[]) => (
    <ul className={styles.ResourcesList}>
      {groups.map(
        (resource: {
          name: {} | null | undefined
          url: string | undefined
        }) => (
          <li key={resource.name}>
            <a href={resource.url}>{resource.name}</a>
          </li>
        )
      )}
    </ul>
  )

  const renderResourceGroup = ({ heading, resources }) => (
    <Grid container id={id} key={heading}>
      <Grid item xs={12}>
        <h4 className={styles.ResourcesHeader}>{heading} Resources</h4>
      </Grid>
      <Grid item xs={12} md={resources.length >= 10 ? 6 : 12}>
        {renderResourcesList(
          resources.slice(0, Math.ceil(resources.length / 2))
        )}
      </Grid>
      {resources.length >= 10 && (
        <Grid item xs={12} md={6}>
          {renderResourcesList(
            resources.slice(Math.ceil(resources.length / 2))
          )}
        </Grid>
      )}
    </Grid>
  )

  return (
    <section>
      <Helmet>
        <title>Health Equity Resources - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>
        Health Equity Resources
      </h2>
      <div className={styles.Resources}>
        <Grid container className={styles.ResourcesHeader}>
          <div className={styles.ResourcesRow}>
            {resourceGroups.map(renderResourceGroup)}
          </div>
        </Grid>
      </div>
    </section>
  )
}

// const renderResourceColumn = (groups: any[]) => {
//   return groups.map(({ heading, resources }) => (
//     <Grid container key={heading} id={id}>
//       <h4>{heading}</h4>

//       <ul>
//         {resources.map(
//           (resource: {
//             // eslint-disable-next-line @typescript-eslint/ban-types
//             name: {} | null | undefined
//             url: string | undefined
//           }) => (
//             <li key={resource.name}>
//               <a href={resource.url}>{resource.name}</a>
//             </li>
//           )
//         )}
//       </ul>
//     </Grid>
//   ))
// }

//   return (
//     <section>
//       <Helmet>
//         <title>
//           Health Equity Resources - Health Equity Tracker
//         </title>
//       </Helmet>
//       <h2 className={styles.ScreenreaderTitleHeader}>
//         Health Equity Resources
//       </h2>
//       <div className={styles.Resources}>
//         <h3>Resources</h3>
//         <Grid className={styles.ResourcesHeader} container>
//           <div className={styles.ResourcesRow}>
//           {resourceGroups.map(renderResourceGroup)}
//             {/* {renderResourceColumn(firstHalf)}
//             {renderResourceColumn(secondHalf)} */}
//           </div>
//         </Grid>
//       </div>
//     </section>
//   )
// }

export default Resources
