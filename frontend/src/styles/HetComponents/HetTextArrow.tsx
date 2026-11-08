import ArrowForward from '@mui/icons-material/ArrowForward'

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
        className={`font-sans-title text-alt-green text-text my-0 mr-2 p-0 font-bold ${textClassName}`}
      >
        {linkText}
      </span>
      <ArrowForward className='text-text m-0 p-0' />
    </p>
  )
}

export default HetTextArrow
