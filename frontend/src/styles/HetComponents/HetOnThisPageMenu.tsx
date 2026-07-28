import { useEffect, useState } from 'react'
import HetReturnToTopFloating from '../../pages/Policy/policyComponents/HetReturnToTopFloating'
import type { RouteConfig } from '../../pages/sharedTypes'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { scrollToHashTarget } from '../../utils/hooks/useScrollToHash'

interface HetOnThisPageMenuProps {
  links?: RouteConfig[]
  className?: string
}

export default function HetOnThisPageMenu(props: HetOnThisPageMenuProps) {
  const [activeLink, setActiveLink] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // TODO: Re-implement passive scroll-spy. activeLink currently only updates on explicit click;
  // the prior scroll-end event listener was removed as dead code, but the use case (highlight
  // current section during scroll) remains valid and should be restored via IntersectionObserver.

  useEffect(() => {
    const storedActiveLink = sessionStorage.getItem('activeLink')
    if (storedActiveLink) {
      setActiveLink(storedActiveLink)
    }
  }, [])

  const handleClick = (path: string) => {
    setActiveLink(path)
    sessionStorage.setItem('activeLink', path)
    scrollToHashTarget(path, { smooth: !prefersReducedMotion })
  }

  return (
    <nav
      aria-label='on this page quick navigation'
      className={`my-2 flex w-full grow flex-col items-center text-left md:w-on-this-page-menu-desktop md:max-w-on-this-page-menu-desktop ${props.className ?? ''}`}
    >
      <ul className='my-1 list-none space-y-2 pl-0 font-roboto text-smallest leading-normal lg:space-y-2'>
        {props.links?.map((link) => (
          <li key={link.path}>
            <button
              type='button'
              onClick={() => handleClick(link.path)}
              className={`m-0 border-none bg-transparent p-0 text-left text-smallest ${
                activeLink === link.path
                  ? 'font-semibold text-alt-green'
                  : 'text-alt-black hover:cursor-pointer'
              }`}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
      <HetReturnToTopFloating />
    </nav>
  )
}
