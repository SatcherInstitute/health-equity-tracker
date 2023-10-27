import * as React from 'react'
import Box from '@mui/material/Box'
import {
  DataGrid,
  GridRenderCellParams,
  type GridColDef,
} from '@mui/x-data-grid'
import {
  RESOURCES,
  PDOH_RESOURCES,
  EQUITY_INDEX_RESOURCES,
  AIAN_RESOURCES,
  API_RESOURCES,
  HISP_RESOURCES,
  MENTAL_HEALTH_RESOURCES,
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
  ECONOMIC_EQUITY_RESOURCES,
  HIV_RESOURCES,
} from '../../WhatIsHealthEquity/ResourcesData'
import { v4 as uuidv4 } from 'uuid'
import styles from '../methodologyComponents/MethodologyPage.module.scss'

const columns: GridColDef[] = [
  { field: 'heading', headerName: 'Category', width: 250, editable: false },
  {
    field: 'name',
    headerName: 'Title',
    width: 500,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const link = params.row.url
      return (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {params.value}
        </a>
      )
    },
  },
]

const ResourcesDataGrid: React.FC = () => {
  const resourceGroups = [
    RESOURCES,
    PDOH_RESOURCES,
    ECONOMIC_EQUITY_RESOURCES,
    EQUITY_INDEX_RESOURCES,
    AIAN_RESOURCES,
    API_RESOURCES,
    HISP_RESOURCES,
    MENTAL_HEALTH_RESOURCES,
    COVID_RESOURCES,
    COVID_VACCINATION_RESOURCES,
    HIV_RESOURCES,
  ]

  const rows = resourceGroups.flatMap((group) =>
    group.resources.map((resource) => ({
      id: uuidv4(),
      heading: group.heading,
      name: resource.name,
      url: resource.url,
    }))
  )

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        className={styles.DataGrid}
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
      />
    </Box>
  )
}

export default ResourcesDataGrid
