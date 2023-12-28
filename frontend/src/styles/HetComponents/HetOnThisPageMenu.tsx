import React, { useState, useEffect, type ReactNode } from 'react'
import { Link as ScrollLink } from 'react-scroll'

interface LinkConfig {
  label: string
  path: string
}

interface CombinedLinkProps {
  to: string
  isScrollLink: boolean
  children: ReactNode
  [x: string]: any
}

const CombinedLink: React.FC<CombinedLinkProps> = ({
  to,
  isScrollLink,
  children,
  ...rest
}) => {
  if (isScrollLink) {
    return (
      <ScrollLink to={to} {...rest}>
        {children}
      </ScrollLink>
    )
  }
  return null
}

interface HetOnThisPageMenuProps {
  links: LinkConfig[]
  className?: string
}

export default function HetOnThisPageMenu(props: HetOnThisPageMenuProps) {
  const [activeLink, setActiveLink] = useState<string | null>(null)

  useEffect(() => {
    const storedActiveLink = sessionStorage.getItem('activeLink')
    if (storedActiveLink) {
      setActiveLink(storedActiveLink)
    }
  }, [])

  useEffect(() => {
    if (activeLink) {
      sessionStorage.setItem('activeLink', activeLink)
    }
  }, [activeLink])

  const handleClick = (path: string) => {
    setActiveLink(path)
  }

  return (
    <>
      <nav
        aria-label='on this page quick navigation'
        className={`m-2 text-left  ${props.className ?? ''}`}
      >
        <h4 className='text-left font-sansTitle text-smallest text-black'>
          On this page
        </h4>
        <ul className='space-t-1 list-none pl-0 leading-lhTight lg:space-y-2'>
          {props.links.map((link, index) => (
            <li key={index}>
              <CombinedLink
                to={link.path}
                isScrollLink
                smooth
                duration={200}
                spy
                hashSpy
                onClick={() => {
                  handleClick(link.path)
                }}
                className={
                  activeLink === link.path ? 'font-semibold text-altGreen' : ''
                }
              >
                <span className='font-sansText text-smallest hover:cursor-pointer'>
                  {link.label}
                </span>
              </CombinedLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
