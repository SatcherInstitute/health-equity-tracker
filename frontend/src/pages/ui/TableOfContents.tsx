import { Step, StepButton, Stepper } from '@mui/material'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { scrollToHashTarget } from '../../utils/hooks/useScrollToHash'
import {
  type ScrollableHashId,
  useStepObserver,
} from '../../utils/hooks/useStepObserver'

interface TableOfContentsProps {
  reportStepHashIds: ScrollableHashId[]
  isScrolledToTop: boolean
}

export default function TableOfContents(props: TableOfContentsProps) {
  const [activeId, setRecentlyClicked] = useStepObserver(
    props.reportStepHashIds,
    props.isScrolledToTop,
  )
  const prefersReducedMotion = usePrefersReducedMotion()

  function handleStepClick(stepId: ScrollableHashId) {
    // same settling and focus behavior a deep link into this card would get
    scrollToHashTarget(stepId, { smooth: !prefersReducedMotion })
    setRecentlyClicked(stepId)
  }

  return (
    <Stepper
      component={'nav'}
      nonLinear
      activeStep={
        props.reportStepHashIds?.indexOf(activeId as ScrollableHashId) ?? 0
      }
      orientation='vertical'
      aria-label='Available cards on this report'
      role='navigation'
      className='titleSm:pl-1p sm:w-90p hidden p-0 sm:flex md:px-5'
    >
      {props.reportStepHashIds?.map((stepId) => {
        return (
          <Step completed={false} key={stepId}>
            <StepButton
              role='button'
              className='text-left'
              onClick={(e) => {
                e.preventDefault()
                handleStepClick(stepId)
              }}
            >
              <span
                // hide labels visually but not from screen readers on small screens
                className='text-alt-dark text-smallest sr-only md:not-sr-only'
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
