import { useAtomValue } from 'jotai'
import HetReturnToTopFloating from '../../pages/Policy/policyComponents/HetReturnToTopFloating'
import type { RouteConfig } from '../../pages/sharedTypes'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { scrollToHashTarget } from '../../utils/hooks/useScrollToHash'
import { activeHashIdAtom } from '../../utils/sharedSettingsState'

interface HetOnThisPageMenuProps {
  links?: RouteConfig[]
  className?: string
}

export default function HetOnThisPageMenu(props: HetOnThisPageMenuProps) {
  const activeLink = useAtomValue(activeHashIdAtom)
  const prefersReducedMotion = usePrefersReducedMotion()

  // TODO: Re-implement passive scroll-spy. activeLink currently only updates on explicit click;
  // the prior scroll-end event listener was removed as dead code, but the use case (highlight
  // current section during scroll) remains valid and should be restored via IntersectionObserver.

  const handleClick = (path: string) => {
    scrollToHashTarget(path, { smooth: !prefersReducedMotion })
  }

  return (
    <nav
      aria-label='on this page quick navigation'
      className={`md:w-on-this-page-menu-desktop md:max-w-on-this-page-menu-desktop my-2 flex w-full grow flex-col items-start text-left ${props.className ?? ''}`}
    >
      <ul className='font-roboto text-smallest my-1 list-none space-y-2 pl-0 leading-normal lg:space-y-2'>
        {props.links?.map((link) => (
          <li key={link.path}>
            <button
              type='button'
              onClick={() => handleClick(link.path)}
              className={`text-smallest m-0 border-none bg-transparent p-0 text-left ${
                activeLink === link.path
                  ? 'text-alt-green font-semibold'
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
