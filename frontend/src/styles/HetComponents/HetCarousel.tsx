import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import { ArrowBack, ArrowForward } from '@mui/icons-material'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

interface HetCarouselProps {
  items: any[]
  CardComponent: React.ComponentType<any>
}

export default function HetCarousel({
  items,
  CardComponent,
}: HetCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(3)

  const isMdAndUp = useIsBreakpointAndUp('md')
  const isSmAndUp = useIsBreakpointAndUp('sm')

  useEffect(() => {
    if (isMdAndUp) {
      setVisibleCards(3)
    } else if (isSmAndUp) {
      setVisibleCards(2)
    } else {
      setVisibleCards(1)
    }
  }, [isMdAndUp, isSmAndUp])

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= items.length - visibleCards ? 0 : prevIndex + 1,
    )
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? items.length - visibleCards : prevIndex - 1,
    )
  }

  return (
    <section className='w-full flex xs:flex-col-reverse md:flex-col py-4'>
      {/* Carousel Controls */}
      <div className='flex flex-row min-h-10 my-4 ml-auto'>
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

      {/* Carousel Cards */}
      <div className='relative md:max-w-eighty overflow-hidden h-auto flex'>
        <div
          className='flex transition-transform duration-500 h-full'
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{ maxWidth: `${100 / visibleCards}%` }}
              className='flex-shrink-0 px-2'
            >
              <CardComponent {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
