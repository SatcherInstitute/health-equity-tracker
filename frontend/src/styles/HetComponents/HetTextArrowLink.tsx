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
      className={`xs:mb-0 xs:pb-0 m-0 flex h-auto items-center justify-start p-0 hover:translate-x-1 hover:transition-transform hover:duration-300 ${containerClassName}`}
    >
      <a
        href={link}
        className={`xs:m-auto m-0 flex h-auto items-center justify-start p-0 no-underline sm:m-auto md:m-0 lg:m-0 xl:m-0 ${linkClassName}`}
      >
        <HetTextArrow linkText={linkText} textClassName={textClassName} />
      </a>
    </div>
  )
}

export default HetTextArrowLink
