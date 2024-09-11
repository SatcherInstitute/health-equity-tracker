import HetTextArrow from './HetTextArrow'

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
        className={`no-underline h-auto  p-0 m-0  flex items-center justify-start xs:mb-4 xl:m-0 lg:m-0 md:m-0 sm:m-auto xs:m-auto ${linkClassName}`}
      >
        <HetTextArrow linkText={linkText} textClassName={textClassName} />
      </a>
    </div>
  )
}

export default HetTextArrowLink
