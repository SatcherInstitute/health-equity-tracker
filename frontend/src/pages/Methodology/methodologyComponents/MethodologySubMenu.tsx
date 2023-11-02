import React, { useState, useEffect, type ReactNode } from 'react'
import { Link as ScrollLink } from 'react-scroll'

interface LinkConfig {
  label: string
  path: string
}

interface MenuProps {
  links: LinkConfig[]
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

const MethodologySubMenu: React.FC<MenuProps> = ({ links }) => {
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
      <h4
        id='submenu'
        className='text-left font-sansTitle text-smallest leading-lhSomeMoreSpace text-black'
      >
        On this page
      </h4>
      <nav
        aria-labelledby='submenu'
        className='sticky right-0 top-0 z-z-middle m-2 text-left lg:z-z-top'
      >
        <ul className='list-none pl-0'>
          {links.map((link, index) => (
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
                  activeLink === link.path ? 'font-semibold text-alt-green' : ''
                }
              >
                <span className='py-3 font-sansText text-small  hover:cursor-pointer'>
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
export default MethodologySubMenu
