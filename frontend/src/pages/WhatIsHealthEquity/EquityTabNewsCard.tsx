import LazyLoad from 'react-lazyload'
import AppbarLogo from '../../assets/AppbarLogo.png'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'

interface EquityTabNewsCardProps {
  href: string
  ariaLabel: string
  imgSrc: string
  imgAlt: string
  title: string
  description?: string
  readMoreHref?: string
}

export function EquityTabNewsCard({
  href,
  ariaLabel,
  imgSrc,
  imgAlt,
  title,
  description,
  readMoreHref,
}: EquityTabNewsCardProps) {
  const getImageSource = (): string => imgSrc || AppbarLogo

  return (
			<a
				href={href}
				className='h-full text-center text-title no-underline'
				aria-label={ariaLabel}
			>
				<LazyLoad once offset={300}>
					<div className='mx-8 flex flex-col items-left rounded-md hover:scale-105 hover:transition-transform hover:duration-30'>
						<div
							className='news-preview-card-image min-h-40 h-56 w-full bg-no-repeat bg-cover bg-center rounded-sm shadow-raised-tighter'
							style={{ backgroundImage: `url(${getImageSource()})` }}
						></div>

						<h3 className='p-0 text-left font-sansText text-text font-bold text-black leading-lhSomeMoreSpace mt-4 mb-0'>
							{title}
						</h3>

						{description && (
							<p className='my-2 md:text-left md:text-text xs:text-small text-black'>
								{description}{' '}
							</p>
						)}
            {readMoreHref && (
              <HetTextArrowLink
                link={readMoreHref}
                aria-label={ariaLabel}
                linkText='Read article at SatcherInstitute.org'
              />
            )}
					</div>
				</LazyLoad>
			</a>
		)
}