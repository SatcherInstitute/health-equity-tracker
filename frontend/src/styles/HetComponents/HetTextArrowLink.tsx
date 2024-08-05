import ArrowRightAlt from '@mui/icons-material/ArrowRightAlt'

interface HetTextArrowLinkProps {
  link: string
  linkText: string
  containerClassName?: string
  linkClassName?: string
  textClassName?: string
}

const HetTextArrowLink: React.FC<HetTextArrowLinkProps> = ({
  link,
  linkText,
  containerClassName,
  linkClassName,
  textClassName,
}) => {
  return (
    <div
      className={`flex items-center justify-start p-0 m-0 hover:translate-x-1 hover:transition-transform hover:duration-300 xs:mb-0 xs:pb-0 h-auto ${containerClassName}`}
    >
      <a
        href={link}
        className={`no-underline h-auto font-sansTitle text-small p-0 m-0 text-altGreen font-bold flex items-center justify-start xs:mb-4 xl:m-0 lg:m-0 md:m-0 sm:m-auto xs:m-auto ${linkClassName}`}
      >
        <p className={`mr-2 p-0 my-0 ${textClassName}`}>{linkText}</p>
        <ArrowRightAlt className='p-0 m-0' />
      </a>
    </div>
  )
}

export default HetTextArrowLink
