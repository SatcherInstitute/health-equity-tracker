import { ArrowForward } from '@mui/icons-material'

interface HetTextArrowProps {
  linkText: string
  textClassName?: string
}

const HetTextArrow: React.FC<HetTextArrowProps> = ({
  linkText,
  textClassName,
}) => {
  return (
    <p className='flex items-center'>
      <span
        className={`font-sansTitle text-small text-altGreen font-bold mr-2 p-0 my-0 ${textClassName}`}
      >
        {linkText}
      </span>
      <ArrowForward className='text-text p-0 m-0' />
    </p>
  )
}

export default HetTextArrow
