import { useRef, useLayoutEffect } from 'react'

const EXPLORE_DATA_ID = 'main'
const INDICATORS = '.MuiIconButton-sizeSmall'

const useScrollPosition = (
  effect: (arg0: {
    pageYOffset: number
    stickyBarOffsetFromTop: number
  }) => void,
  sticking: boolean[],
  wait: number | undefined
) => {
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null)

  useLayoutEffect(() => {
    const scrollCallBack = (stickyBarOffsetFromTop: number) => {
      effect({ pageYOffset: window.pageYOffset, stickyBarOffsetFromTop })
      throttleTimeout.current = null
    }

    const handleScroll = () => {
      const header = document.getElementById(EXPLORE_DATA_ID)
      const indicators =
        document.querySelectorAll(INDICATORS)?.[0]?.parentElement
      const stickyBarOffsetFromTop = header?.offsetTop ?? 1
      const topOfMadLibContainer = window.pageYOffset > stickyBarOffsetFromTop

      if (topOfMadLibContainer) {
        indicators?.classList.add('hidden')
      } else {
        indicators?.classList.remove('hidden')
      }

      if (wait) {
        if (throttleTimeout.current === null) {
          throttleTimeout.current = setTimeout(function () {
            scrollCallBack(stickyBarOffsetFromTop)
          }, wait)
        }
      } else {
        scrollCallBack(stickyBarOffsetFromTop)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sticking, effect, wait])
}

export default useScrollPosition
