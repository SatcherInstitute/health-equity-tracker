import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import { ArrowBack, ArrowForward } from '@mui/icons-material'

interface HetCarouselProps {
  items: any[]
  CardComponent: React.ComponentType<any>
}

export default function HetCarousel({
  items,
  CardComponent,
}: HetCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleItems, setVisibleItems] = useState(3)

  useEffect(() => {
    const updateVisibleItems = () => {
      const screenWidth = window.innerWidth
      if (screenWidth < 600) {
        setVisibleItems(1)
      } else if (screenWidth < 960) {
        setVisibleItems(2)
      } else {
        setVisibleItems(3)
      }
    }
    updateVisibleItems()
    window.addEventListener('resize', updateVisibleItems)

    return () => window.removeEventListener('resize', updateVisibleItems)
  }, [])

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= items.length - visibleItems ? 0 : prevIndex + 1,
    )
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? items.length - visibleItems : prevIndex - 1,
    )
  }

  return (
    <section className='w-full flex flex-col py-4'>
      {/* Carousel Cards */}
      <div className='relative overflow-hidden'>
        <div
          className='flex transition-transform duration-500 ease-in-out'
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className='flex-shrink-0 px-2'
              style={{ width: `${100 / visibleItems}%` }}
            >
              <CardComponent {...item} />
            </div>
          ))}
        </div>
      </div>
      {/* Carousel Controls */}
      <div className='flex min-h-10 mt-4 mx-auto'>
        <Button
          aria-label='previous'
          onClick={handlePrev}
          className='w-16 rounded-xl bg-methodologyGreen text-altBlack shadow-sm hover:shadow-raised transition-transform transform hover:scale-110 mx-1'
        >
          <ArrowBack />
        </Button>
        <Button
          aria-label='next'
          onClick={handleNext}
          className='w-16 rounded-xl bg-methodologyGreen text-altBlack shadow-sm hover:shadow-raised transition-transform transform hover:scale-110 mx-1'
        >
          <ArrowForward />
        </Button>
      </div>
    </section>
  )
}
