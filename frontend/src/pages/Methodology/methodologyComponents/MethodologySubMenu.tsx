import styles from './MethodologyPage.module.scss'
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
    <nav className={styles.SubMenu}>
      <p>On this page</p>
      {links.map((link, index) => (
        <CombinedLink
          key={index}
          to={link.path}
          isScrollLink
          smooth
          duration={200}
          spy
          hashSpy
          onClick={() => {
            handleClick(link.path)
          }}
          className={activeLink === link.path ? styles.active : ''}
        >
          <span className="hover:cursor-pointer">{link.label}</span>
        </CombinedLink>
      ))}
    </nav>
  )
}
export default MethodologySubMenu
