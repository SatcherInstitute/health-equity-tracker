import type React from 'react';
import ContextSectionTabs from './ContextSectionTabs';

export default function ContextSection() {
	return (
		<>
			<section className='px-80 max-w-screen'>
				<p  className="my-3 text-center font-roboto text-smallest font-semibold uppercase text-black">
					In Focus
				</p>
				<div className="flex w-full flex-col justify-center items-center md:block sm:block">
					<h2 className="m-0 font-sansTitle text-biggerHeader font-bold leading-lhModalHeading text-altGreen text-center xs:text-header">
						The Scourge of Gun Violence in Atlanta
					</h2>

					<p className="text-center my-4 text-title">
						This pervasive public health challenge harms communities nationwide,
						disproportionately affecting Black communities. It's crucial to
						understand its impacts on mental, physical, and social health, often
						exacerbated by racial motives.
					</p>
					<img
						src="/img/graphics/DrSatcher.png"
						alt="image of David Satcher, MD, PhD"
					></img>

					<p className="text-center text-smallestHeader my-0">
						Our children should be given a personal sense of security. That’s
						not always there in communities of high poverty. There’s a lot of
						insecurity. Often children turn to gangs and guns because they feel
						insecure...we need to take the steps necessary to protect them.
					</p>

					<p className="text-center text-smallestHeader font-bold my-2">
						Gun violence is a major public health problem.
					</p>
					<p className="text-center text-navBarHeader mt-8">
						David Satcher, M.D., Ph.D.
						<p className="text-center text-text my-0">
							Founding Director & Senior Advisor
						</p>
					</p>
				</div>
<ContextSectionTabs/>

			</section>
		</>
	);
}
