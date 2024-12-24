import { Button, TextField } from '@mui/material'
import { urlMap } from '../../utils/externalUrls'

interface HetEmailSignupProps {
  id: string
  className?: string
}

export default function HetEmailSignup(props: HetEmailSignupProps) {
  return (
    <form
      action={urlMap.newsletterSignup}
      method='post'
      target='_blank'
      className={props.className}
    >
      <div className='flex content-center justify-center gap-1 '>
        <TextField
          id={props.id}
          name='MERGE0'
          variant='outlined'
          className='rounded-sm leading-lhSuperLoose shadow-raised-tighter'
          type='email'
          label='Email Address'
        />

        <Button
          type='submit'
          variant='contained'
          className='whitespace-nowrap py-0 leading-lhSuperLoose shadow-raised-tighter'
          aria-label='Sign Up for Newsletter in a new window'
        >
          Sign up
        </Button>
      </div>
    </form>
  )
}
