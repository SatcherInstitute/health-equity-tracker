import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { Grid } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { type ResourceGroup } from '../../WhatIsHealthEquity/ResourcesData'

interface ResourcesProps {
  resourceGroups: ResourceGroup[]
  id?: string
}

interface Resource {
  name: string | null | undefined
  url: string | undefined
}

function Resources({ resourceGroups, id }: ResourcesProps) {
  const renderResourcesList = (groups: Resource[]) => (
    <ul className={styles.ResourcesList}>
      {groups.map((resource) => (
        <li key={resource.name ? resource.name : ''}>
          <a href={resource.url}>{resource.name}</a>
        </li>
      ))}
    </ul>
  )

  const renderResourceGroup = ({
    heading,
    resources,
  }: {
    heading: string
    resources: Resource[]
  }) => (
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
      <h2 className='sr-only'>Health Equity Resources</h2>
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

export default Resources
