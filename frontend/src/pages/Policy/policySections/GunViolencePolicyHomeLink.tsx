import { HetOverline } from "../../../styles/HetComponents/HetOverline";

export default function GunViolencePolicyHomeLink() {
	return (
		<>
			<section className='relative'>
<<<<<<< HEAD
				<HetOverline text='In Focus' className='text-center'/>
=======
				<p className='mb-3 mt-0 text-center font-roboto text-smallest font-semibold uppercase text-black'>
					In Focus
				</p>
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
				<div className='flex w-full flex-col justify-center items-center'>
					<h2 className='m-0 font-sansTitle text-biggerHeader font-bold leading-lhModalHeading text-altGreen text-center xs:text-header'>
					Understanding the Crisis of Gun Violence in Atlanta
					</h2>

					<p className='text-center my-4 text-title lg:px-32 px-8 lg:py-8 py-4'>
						This pervasive public health challenge harms communities nationwide,
						disproportionately affecting Black communities. It's crucial to
						understand its impacts on mental, physical, and social health, often
						exacerbated by racial motives.
					</p>
					<article className='rounded-md shadow-raised bg-white flex lg:px-24 px-8 pb-8 pt-0 lg:mt-8 mt-4'>
						<div className='flex flex-col align-center'
						>
							<img
								className='mx-auto my-0 p-0 fade-in-up-blur'
								src='/img/graphics/DrSatcher.png'
								alt='David Satcher, MD, PhD'
								style={{ animationDelay: `${0.3}s` }}
							></img>

							<p className='text-center text-text text-altGreen font-bold text-sansText pt-0 mt-0 fade-in-up-blur' style={{ animationDelay: `${0.2}s` }}>
								David Satcher, M.D., Ph.D.
								<p className='text-center text-small my-0 text-sansText' >
									Founding Director & Senior Advisor
								</p>
							</p>

							<div className='relative text-center'>
								<span className='absolute xs:top-[-15rem] xs:left-[-2rem] md:top-[-13rem] md:left-[-1rem] lg:top-[-14rem] lg:left-[-5rem] m-0 p-0 text-[20rem] text-hoverAltGreen'>
									&#10077;
								</span>
								<p className='font-roboto text-title my-0 leading-4  fade-in-up-blur' style={{ animationDelay: `${0.4}s` }}>
									Our children should be given a personal sense of security.
									That’s not always there in communities of high poverty.
									There’s a lot of insecurity. Often children turn to gangs and
									guns because they feel insecure...we need to take the steps
									necessary to protect them.
								</p>

								<p className='font-roboto text-title font-bold my-2'>
									Gun violence is a major public health problem.
								</p>
							</div>
						</div>
					</article>
				</div>
			</section>
		</>
	)
}