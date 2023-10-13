import styles from './MethodologyPage.module.scss'
import React, { type ReactNode } from 'react'
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
  [x: string]: any // For the rest of the props
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
}

const MethodologySubMenu: React.FC<MenuProps> = ({ links }) => {
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
        >
          {link.label}
        </CombinedLink>
      ))}
    </nav>
  )
}

export default MethodologySubMenu
