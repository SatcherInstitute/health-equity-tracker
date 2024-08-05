import { CRISIS_OVERVIEW_TAB, DATA_COLLECTION_TAB, ADDRESSING_INEQUITIES_TAB, CURRENT_EFFORTS_TAB, REFORM_OPPORTUNITIES_TAB, HOW_TO_USE_THE_DATA_TAB, FAQS_TAB, POLICY_PAGE_LINK } from "../../../utils/internalRoutes";

export default function GunViolencePolicyHomeLink() {
	return (
		<>
			<ul>
				<li><a href={CRISIS_OVERVIEW_TAB}>CRISIS_OVERVIEW_TAB</a></li>
				<li><a href={DATA_COLLECTION_TAB}>DATA_COLLECTION_TAB</a></li>
				<li><a href={ADDRESSING_INEQUITIES_TAB}>ADDRESSING_INEQUITIES_TAB</a></li>
				<li><a href={CURRENT_EFFORTS_TAB}>CURRENT_EFFORTS_TAB</a></li>
				<li><a href={REFORM_OPPORTUNITIES_TAB}>REFORM_OPPORTUNITIES_TAB</a></li>
				<li><a href={HOW_TO_USE_THE_DATA_TAB}>HOW_TO_USE_THE_DATA_TAB</a></li>
				<li><a href={FAQS_TAB}>FAQS_TAB</a></li>
				<li><a href={POLICY_PAGE_LINK}>POLICY_PAGE_LINK</a></li>
			</ul>
			<h1>Gun Violence Policy Context Overview</h1>
			<section className='py-4 xs:px-8 md:px-24 lg:px-80 max-w-screen'>
				<p className='my-3 text-center font-roboto text-smallest font-semibold uppercase text-black'>
					In Focus
				</p>
				<div className='flex w-full flex-col justify-center items-center'>
					<h2 className='m-0 font-sansTitle text-biggerHeader font-bold leading-lhModalHeading text-altGreen text-center xs:text-header'>
						The Scourge of Gun Violence in Atlanta
					</h2>

					<p className='text-center my-4 text-title'>
						This pervasive public health challenge harms communities nationwide,
						disproportionately affecting Black communities. It's crucial to
						understand its impacts on mental, physical, and social health, often
						exacerbated by racial motives.
					</p>
					<img
						src='/img/graphics/DrSatcher.png'
						alt='David Satcher, MD, PhD'
					></img>

					<p className='text-center text-smallestHeader my-0'>
						Our children should be given a personal sense of security. That’s
						not always there in communities of high poverty. There’s a lot of
						insecurity. Often children turn to gangs and guns because they feel
						insecure...we need to take the steps necessary to protect them.
					</p>

					<p className='text-center text-smallestHeader font-bold my-2'>
						Gun violence is a major public health problem.
					</p>
					<p className='text-center text-navBarHeader mt-8'>
						David Satcher, M.D., Ph.D.
						<p className='text-center text-text my-0'>
							Founding Director & Senior Advisor
						</p>
					</p>
				</div>
			</section>
		</>
	)
}