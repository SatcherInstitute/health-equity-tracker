import OutlinedFlag from '@mui/icons-material/OutlinedFlag'
import {
  Button,
  FormControlLabel,
  Popover,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import {
  FLAG_REASON_OPTIONS,
  type FlagReason,
  flagInsight,
} from '../../utils/flagInsight'

interface FlagInsightButtonProps {
  // The exact server cache key the insight was generated/stored under.
  cacheKey?: string
  // The displayed insight text, stored for team review.
  content?: string
  // Topic identifier (e.g. dataTypeId) so flags can be scoped per topic.
  topic?: string
  // Called after a successful flag so the parent can hide/clear the insight.
  onFlagged: () => void
}

export default function FlagInsightButton(props: FlagInsightButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [reason, setReason] = useState<FlagReason | ''>('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
    setError(false)
  }

  const handleSubmit = async () => {
    if (!reason || !props.cacheKey) return
    setSubmitting(true)
    setError(false)
    const ok = await flagInsight({
      cacheKey: props.cacheKey,
      reason,
      note: note.trim() || undefined,
      content: props.content,
      topic: props.topic,
    })
    setSubmitting(false)
    if (ok) {
      handleClose()
      props.onFlagged()
    } else {
      setError(true)
    }
  }

  return (
    <>
      <Button
        size='small'
        startIcon={<OutlinedFlag fontSize='small' />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={!props.cacheKey}
        aria-label='flag this insight'
      >
        Flag this insight
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div className='flex w-72 flex-col gap-2 p-4'>
          <span className='font-semibold text-alt-dark text-small'>
            Why are you flagging this insight?
          </span>
          <RadioGroup
            value={reason}
            onChange={(e) => setReason(e.target.value as FlagReason)}
          >
            {FLAG_REASON_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size='small' />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          <TextField
            label='Add a note (optional)'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={2}
            size='small'
            fullWidth
          />
          {error && (
            <p className='m-0 text-red-500 text-smallest'>
              Could not submit flag. Please try again.
            </p>
          )}
          <div className='flex justify-end gap-2'>
            <Button size='small' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              size='small'
              variant='contained'
              onClick={handleSubmit}
              disabled={!reason || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit flag'}
            </Button>
          </div>
        </div>
      </Popover>
    </>
  )
}
