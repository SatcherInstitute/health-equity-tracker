import {
  Step,
  StepButton,
  Stepper,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  useStepObserver,
  type ScrollableHashId,
} from '../../utils/hooks/useStepObserver'
import styles from './TableOfContents.module.scss'
import { scrollIntoView } from 'seamless-scroll-polyfill'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'

interface TableOfContentsProps {
  reportStepHashIds: ScrollableHashId[]
  isScrolledToTop: boolean
}

export default function TableOfContents(props: TableOfContentsProps) {
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('md'))

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
      orientation="vertical"
      aria-label="Available cards on this report"
      className={styles.Stepper}
    >
      {props.reportStepHashIds?.map((stepId) => {
        return (
          <Step completed={false} key={stepId}>
            <Tooltip title={`Scroll to ${reportProviderSteps[stepId].label}`}>
              <StepButton
                // title=
                className={styles.StepButton}
                onClick={(e) => {
                  e.preventDefault()
                  handleStepClick(stepId)
                }}
              >
                <span
                  // hide labels visually but not from screen readers on small screens
                  className={
                    pageIsWide
                      ? styles.StepButtonLabel
                      : styles.ScreenreaderTitleHeader
                  }
                >
                  {reportProviderSteps[stepId].label}
                </span>
              </StepButton>
            </Tooltip>
          </Step>
        )
      })}
    </Stepper>
  )
}
