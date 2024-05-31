import {
  ABOUT_US_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import { LinkWithStickyParams } from '../../utils/urlutils'

import HetEmailSignup from '../../styles/HetComponents/HetEmailSignup'

export default function SignupSection() {
  return (
    <section className='m-5 flex w-11/12 max-w-sm flex-col sm:m-20'>
      <p>
        Please{' '}
        <LinkWithStickyParams to={ABOUT_US_PAGE_LINK}>
          contact us
        </LinkWithStickyParams>{' '}
        with any questions or concerns, and{' '}
        <LinkWithStickyParams to={SHARE_YOUR_STORY_TAB_LINK}>
          consider sharing your own story
        </LinkWithStickyParams>
        .
      </p>
      <p>
        For more information about health equity, please sign up for our Satcher
        Health Leadership Institute newsletter.
      </p>
      <HetEmailSignup id='signup-section-email-signup' />
    </section>
  )
}
