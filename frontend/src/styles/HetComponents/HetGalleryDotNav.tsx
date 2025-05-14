import type React from 'react'

interface HetGalleryDotNavProps {
  items: Array<{ id: number | string; title?: string }>
  currentIndex: number
  onSelect: (index: number) => void
  className?: string
  activeColor?: string
  inactiveColor?: string
}

const HetGalleryDotNav: React.FC<HetGalleryDotNavProps> = ({
  items,
  currentIndex,
  onSelect,
  className = '',
  activeColor = 'bg-methodologyGreen',
  inactiveColor = 'bg-gray-300',
}) => {
  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      {items.map((item, index) => {
        const ariaLabel = `View item ${index + 1}${
          item.title ? `: ${item.title}` : ''
        }`

        return (
          <button
            key={item.id}
            className={`h-3 w-3 cursor-pointer rounded-full ${
              index === currentIndex ? activeColor : inactiveColor
            }`}
            onClick={() => onSelect(index)}
            aria-label={ariaLabel}
            aria-current={index === currentIndex ? 'true' : undefined}
            type='button'
          />
        )
      })}
    </div>
  )
}

export default HetGalleryDotNav
