import { useLocation, useNavigate } from 'react-router-dom'
import type { RouteConfig } from '../../pages/sharedTypes'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import HetPaginationButton from './HetPaginationButton'

interface HetPaginationProps {
  routeConfigs: RouteConfig[]
  className?: string
}

export default function HetPagination({
  routeConfigs,
  className,
}: HetPaginationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isLargeScreen = useIsBreakpointAndUp('md')
  const currentIndex = routeConfigs.findIndex(
    (route) => route.path === location.pathname,
  )
  const nextRoute = routeConfigs[currentIndex + 1]
  const prevRoute = routeConfigs[currentIndex - 1]

  function goNext() {
    if (nextRoute) {
      navigate(nextRoute.path)
    }
  }

  function goPrevious() {
    if (prevRoute) {
      navigate(prevRoute.path)
    }
  }

  const nextButtonClassName = !prevRoute && isLargeScreen ? 'ml-auto' : ''

  return (
    <div
      className={`mx-0 mt-8 mb-8 flex w-full flex-col justify-between gap-4 smMd:mb-0 md:mt-16 md:flex-row md:self-stretch ${className ?? ''}`}
    >
      {prevRoute && (
        <HetPaginationButton direction='previous' onClick={goPrevious}>
          {prevRoute.label}
        </HetPaginationButton>
      )}

      {nextRoute && (
        <HetPaginationButton
          className={nextButtonClassName}
          direction='next'
          onClick={goNext}
          disabled={currentIndex === routeConfigs.length - 1}
        >
          {nextRoute.label}
        </HetPaginationButton>
      )}
    </div>
  )
}
