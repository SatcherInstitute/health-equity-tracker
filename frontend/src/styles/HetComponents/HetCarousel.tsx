import { useState } from 'react'
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

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= items.length - 1 ? 0 : prevIndex + 1,
    )
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? items.length - 1 : prevIndex - 1,
    )
  }

  return (
    <section className='w-full flex flex-col py-4'>
      {/* Carousel Cards */}
      <div className='relative overflow-hidden h-auto'>
        <div
          className='flex transition-transform duration-500'
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className='flex-shrink-0 px-2 w-full sm:w-1/2 md:w-1/3'
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
          className={`w-16 rounded-xl bg-methodologyGreen text-altBlack shadow-sm hover:shadow-raised transition-transform transform hover:scale-110 mx-1`}
        >
          <ArrowBack />
        </Button>
        <Button
          aria-label='next'
          onClick={handleNext}
          className={`w-16 rounded-xl bg-methodologyGreen text-altBlack shadow-sm hover:shadow-raised transition-transform transform hover:scale-110 mx-1`}
        >
          <ArrowForward />
        </Button>
      </div>
    </section>
  )
}
