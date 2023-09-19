import styles from './DataCatalogPage.module.scss'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link as ScrollLink } from 'react-scroll'

interface LinkConfig {
  label: string
  path: string
}

interface MenuProps {
  links: LinkConfig[]
}

const MethodologySubMenu: React.FC<MenuProps> = ({ links }) => {

  const CombinedLink = ({ to, isScrollLink, ...rest }: { to: any, isScrollLink: boolean, rest: any }) => {
    if (isScrollLink) {
      return <ScrollLink to={to} {...rest} />
    }
    return <RouterLink to={to} {...rest} />
  }

  return (
    <nav className={styles.SubMenu}>
      <p>On this page</p>
      <h4>Limitations</h4>
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
