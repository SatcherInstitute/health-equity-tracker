import type { ReactNode } from 'react'

export type RouteConfig = {
  isTopLevel?: boolean
  label: string
  path: string
  component?: ReactNode
  subLinks?: RouteConfig[]
  visible?: boolean
}
