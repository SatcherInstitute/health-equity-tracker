import styles from './DataCatalogPage.module.scss'
import React, { useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import { Link as ScrollLink, Events, Element } from 'react-scroll'

interface LinkConfig {
  label: string
  path: string
}

interface MenuProps {
  links: LinkConfig[]
}

const MethodologySubMenu: React.FC<MenuProps> = ({ links }) => {
  const [isSticky, setSticky] = useState(false)
  const handleScroll = () => {
    if (window.pageYOffset > 0) {
      setSticky(true)
    } else {
      setSticky(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const CombinedLink = ({ to, isScrollLink, ...rest }) => {
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
