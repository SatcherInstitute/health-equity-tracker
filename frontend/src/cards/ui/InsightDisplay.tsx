import { DeleteForever, TipsAndUpdatesOutlined } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import type React from 'react'

type InsightDisplayProps = {
  insight: string
  handleGenerateInsight: () => void
  handleClearInsight: () => void
  isGeneratingInsight: boolean
}

const InsightDisplay: React.FC<InsightDisplayProps> = ({
  insight,
  handleGenerateInsight,
  handleClearInsight,
  isGeneratingInsight,
}) => {
  return (
    <>
      <IconButton
        onClick={insight ? handleClearInsight : handleGenerateInsight}
        className='absolute top-2 right-2 z-10'
        disabled={isGeneratingInsight}
      >
        {isGeneratingInsight ? (
          <CircularProgress size={24} />
        ) : insight ? (
          <DeleteForever />
        ) : (
          <TipsAndUpdatesOutlined />
        )}
      </IconButton>
      <p className='text-text smMd:text-smallestHeader p-8 m-0 text-center text-altDark'>
        {isGeneratingInsight ? 'Generating insight...' : insight}
      </p>
    </>
  )
}

export default InsightDisplay
