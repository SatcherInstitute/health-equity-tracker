import { useEffect, useState } from 'react'
import HetReturnToTopFloating from '../../pages/Policy/policyComponents/HetReturnToTopFloating'
import type { RouteConfig } from '../../pages/sharedTypes'
import { useScrollToAnchor } from '../../utils/hooks/useScrollToAnchor'

interface HetOnThisPageMenuProps {
  links?: RouteConfig[]
  className?: string
}

interface CombinedLinkProps {
  to: string
  isScrollLink: boolean
  children: React.ReactNode
  [x: string]: any
}

function CombinedLink(props: CombinedLinkProps) {
  const { to, isScrollLink, children, className, ...rest } = props
  const scrollToAnchor = useScrollToAnchor()

  if (isScrollLink) {
    return (
      <button
        onClick={() => scrollToAnchor(to)}
        type='button'
        {...rest}
        className={`m-0 border-none bg-transparent p-0 text-left text-smallest ${className ?? ''}`}
      >
        {children}
      </button>
    )
  }
  return null
}

export default function HetOnThisPageMenu(props: HetOnThisPageMenuProps) {
  const [activeLink, setActiveLink] = useState<string | null>(null)
  const scrollToAnchor = useScrollToAnchor()

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
    scrollToAnchor(path)
  }

  return (
    <>
      <nav
        aria-label='on this page quick navigation'
        className={`my-2 flex w-full grow flex-col items-center text-left md:w-on-this-page-menu-desktop md:max-w-on-this-page-menu-desktop ${props.className ?? ''}`}
      >
        <ul className='my-1 list-none space-y-2 pl-0 font-roboto text-smallest leading-normal lg:space-y-2'>
          {props.links?.map((link) => (
            <li key={link.path}>
              <CombinedLink
                to={link.path}
                isScrollLink
                onClick={() => handleClick(link.path)}
                tabIndex={0}
                className={
                  activeLink === link.path
                    ? 'font-semibold text-alt-green'
                    : 'text-alt-black hover:cursor-pointer'
                }
              >
                {link.label}
              </CombinedLink>
            </li>
          ))}
        </ul>
        <HetReturnToTopFloating />
      </nav>
    </>
  )
}
