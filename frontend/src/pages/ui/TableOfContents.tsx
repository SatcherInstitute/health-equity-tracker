import { Step, StepButton, Stepper } from '@mui/material'
import {
  useStepObserver,
  type ScrollableHashId,
} from '../../utils/hooks/useStepObserver'
import { scrollIntoView } from 'seamless-scroll-polyfill'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'

interface TableOfContentsProps {
  reportStepHashIds: ScrollableHashId[]
  isScrolledToTop: boolean
}

export default function TableOfContents(props: TableOfContentsProps) {
  const [activeId, setRecentlyClicked] = useStepObserver(
    props.reportStepHashIds,
    props.isScrolledToTop
  )

  function handleStepClick(stepId: ScrollableHashId) {
    const clickedElem: HTMLElement | null = document.querySelector(`#${stepId}`)

    if (clickedElem) {
      scrollIntoView(clickedElem, { behavior: 'smooth' })
      // for a11y focus should shift to subsequent tab goes to next interactive element after the targeted card
      clickedElem.focus({ preventScroll: true })
      // manually set the browser url#hash for actual clicks
      window.history.replaceState(undefined, '', `#${stepId}`)
    }

    setRecentlyClicked(stepId)
  }

  return (
    <Stepper
      component={'nav'}
      nonLinear
      activeStep={props.reportStepHashIds?.findIndex(
        (stepId) => stepId === activeId
      )}
      orientation='vertical'
      aria-label='Available cards on this report'
      className='hidden p-0 sm:flex sm:w-90p titleSm:pl-1p md:px-5'
    >
      {props.reportStepHashIds?.map((stepId) => {
        return (
          <Step completed={false} key={stepId}>
            <StepButton
              // title=
              className='text-left'
              onClick={(e) => {
                e.preventDefault()
                handleStepClick(stepId)
              }}
            >
              <span
                // hide labels visually but not from screen readers on small screens
                className='sr-only text-smallest md:not-sr-only'
              >
                {reportProviderSteps[stepId].label}
              </span>
            </StepButton>
          </Step>
        )
      })}
    </Stepper>
  )
}
