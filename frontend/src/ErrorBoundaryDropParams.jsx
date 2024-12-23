import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      // strip the user's URL of all params in case they are malformed
      window.location = window.location.pathname
      //  render fallback component
      return this.props.fallback
    }

    return this.props.children
  }
}
