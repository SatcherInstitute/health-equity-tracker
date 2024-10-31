import React from 'react'

export default function createHighlightedPreview(
  answer: string | React.ReactNode,
  searchTerm: string,
  p0: number,
): React.ReactNode {
  if (!searchTerm) return answer // Return answer as-is if there's no search term

  const highlight = (text: string) => {
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return highlight(node)
    } else if (React.isValidElement(node)) {
      // Clone the element and process its children recursively
      return React.cloneElement(
        node,
        { ...node.props },
        React.Children.map(node.props.children, (child) => processNode(child)),
      )
    } else if (Array.isArray(node)) {
      return node.map((child, index) => (
        <React.Fragment key={index}>{processNode(child)}</React.Fragment>
      ))
    }
    return node
  }

  return processNode(answer)
}
