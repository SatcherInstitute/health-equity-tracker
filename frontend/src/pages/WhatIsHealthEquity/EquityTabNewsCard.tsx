<<<<<<< HEAD
<<<<<<< HEAD
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
=======
import React from 'react';
import LazyLoad from 'react-lazyload';
import { HetTags } from '../../styles/HetComponents/HetTags';
import AppbarLogo from '../../assets/AppbarLogo.png';
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink';

interface EquityTabNewsCardProps {
  href: string;
  ariaLabel: string;
  imgSrc: string;
  imgAlt: string;
  title: string;
  description?: string;
  readMoreHref?: string;
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
=======
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
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)
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
<<<<<<< HEAD
<<<<<<< HEAD
  const getImageSource = (): string => imgSrc || AppbarLogo
=======
  const getImageSource = (): string => imgSrc || AppbarLogo;
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
=======
  const getImageSource = (): string => imgSrc || AppbarLogo
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)

  return (
			<a
				href={href}
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
				className="h-full text-center text-title no-underline"
=======
				className='h-full text-center text-title no-underline'
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)
				aria-label={ariaLabel}
			>
				<LazyLoad once offset={300}>
					<div className='mx-8 flex flex-col items-left rounded-md hover:scale-105 hover:transition-transform hover:duration-30'>
						<div
							className='news-preview-card-image min-h-40 h-56 w-full bg-no-repeat bg-cover bg-center rounded-sm shadow-raised-tighter'
							style={{ backgroundImage: `url(${getImageSource()})` }}
						></div>

<<<<<<< HEAD
						<h3 className="p-0 text-left font-sansText text-text font-bold text-black leading-lhSomeMoreSpace mt-4 mb-0">
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
=======
						<h3 className='p-0 text-left font-sansText text-text font-bold text-black leading-lhSomeMoreSpace mt-4 mb-0'>
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)
							{title}
						</h3>

						{description && (
<<<<<<< HEAD
<<<<<<< HEAD
							<p className='my-2 md:text-left md:text-text xs:text-small text-black'>
								{description}{' '}
=======
							<p className="my-2 md:text-left md:text-text xs:text-small text-black">
								{description}{" "}
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
=======
							<p className='my-2 md:text-left md:text-text xs:text-small text-black'>
								{description}{' '}
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)
							</p>
						)}
            {readMoreHref && (
              <HetTextArrowLink
                link={readMoreHref}
                aria-label={ariaLabel}
<<<<<<< HEAD
<<<<<<< HEAD
                linkText='Read article at SatcherInstitute.org'
=======
                linkText="Read article at SatcherInstitute.org"
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
=======
                linkText='Read article at SatcherInstitute.org'
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)
              />
            )}
					</div>
				</LazyLoad>
			</a>
<<<<<<< HEAD
<<<<<<< HEAD
		)
=======
		);
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
=======
		)
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)
}