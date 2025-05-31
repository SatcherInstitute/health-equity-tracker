import { ArrowBack, ArrowForward } from '@mui/icons-material'
import Button from '@mui/material/Button'
import { useEffect, useState } from 'react'

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
    <section className='flex w-full flex-col py-4'>
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
              className='shrink-0 px-2'
              style={{ width: `${100 / visibleItems}%` }}
            >
              <CardComponent {...item} />
            </div>
          ))}
        </div>
      </div>

      <div className='mx-auto mt-4 flex min-h-10'>
        <Button
          aria-label='previous'
          onClick={handlePrev}
          className='mx-1 w-16 transform rounded-xl bg-methodology-green text-alt-black shadow-sm transition-transform hover:scale-110 hover:shadow-raised'
        >
          <ArrowBack />
        </Button>
        <Button
          aria-label='next'
          onClick={handleNext}
          className='mx-1 w-16 transform rounded-xl bg-methodology-green text-alt-black shadow-sm transition-transform hover:scale-110 hover:shadow-raised'
        >
          <ArrowForward />
        </Button>
      </div>
    </section>
  )
}
