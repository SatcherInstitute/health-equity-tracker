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
        className={`my-0 mr-2 p-0 font-bold font-sans-title text-alt-green text-text ${textClassName}`}
      >
        {linkText}
      </span>
      <ArrowForward className='m-0 p-0 text-text' />
    </p>
  )
}

export default HetTextArrow
