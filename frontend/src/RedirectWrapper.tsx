import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface RedirectWrapperProps {
  from: string
  to: string
}

export default function RedirectWrapper(props: RedirectWrapperProps) {
  const { from, to } = props
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === from) {
      navigate(to, { replace: true })
    }
  }, [location, navigate, from, to])

  return null
}
