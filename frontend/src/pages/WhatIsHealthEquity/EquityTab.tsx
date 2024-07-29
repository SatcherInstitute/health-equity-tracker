import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LazyLoad from 'react-lazyload'
import FaqSection from '../ui/FaqSection'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import { urlMap } from '../../utils/externalUrls'
import { EquityTabNewsCard } from './EquityTabNewsCard'
import { NEWS_ARTICLES } from './EquityTabNewsCardData'
import { useQuery } from 'react-query'
import { ARTICLES_KEY_4, fetchLandingPageNewsData, REACT_QUERY_OPTIONS } from '../../utils/blogUtils'

export default function EquityTab() {
	const { isLoading, error, data }: any = useQuery(
		ARTICLES_KEY_4,
		fetchLandingPageNewsData,
		REACT_QUERY_OPTIONS,
	  )
	return (
		<>
			<Helmet>
				<title>What is Health Equity? - Health Equity Tracker</title>
			</Helmet>
			<div className='m-auto flex w-full max-w-lgXl flex-wrap xs:px-8 sm:px-24'>
				<div className='flex w-full items-center justify-center border-0 border-b border-solid border-borderColor'>
					<figure className='mx-auto mt-0 hidden p-2 text-left md:block md:w-1/3'>
						<LazyLoad
							offset={300}
							height={760}
							once
							className='flex justify-center'
						>
							<img
								alt=''
								className='m-5 h-auto w-9/12 max-w-equityLogo rounded-md'
								src='/img/stock/woman-in-wheelchair-with-tea.png'
							/>
						</LazyLoad>
					</figure>
					<div className='w-full border-0 px-15 py-8 md:w-2/3 md:border-l md:border-solid md:px-16 md:py-28'>
						<header className='mb-10'>
							<h2
								id='main'
								className='mb-4 mt-0 font-serif text-header font-light leading-lhNormal text-altGreen sm:text-bigHeader md:text-biggerHeader md:text-left xs:text-center'
							>
								What is Health Equity?
							</h2>
						</header>
						<p className='mb-4 mt-0 text-left font-sansText text-title font-normal leading-lhLoose'>
							<b>Health Equity</b> exists when all people, regardless of race,
							sex, sexual orientation, disability, socio-economic status,
							geographic location, or other societal constructs have fair and
							just access, opportunity, and resources to achieve their highest
							potential for health.
						</p>
						<p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
							Unfortunately, social and political determinants of health
							negatively affect many communities, their people, and their
							ability to lead healthy lives.
						</p>
						<p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
							<span className='text-small text-altDark'>
								Health Equity Leadership & Exchange Network, 2020
							</span>
						</p>
						<div className='flex w-full flex-wrap items-start justify-between text-left'>
							{/* PDOH */}
							<section className='w-full p-4 pl-0 md:w-1/2'>
								<h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
									Political determinants of health
								</h3>
								<p className='my-2 text-small leading-lhLoose'>
									The Political determinants of health involve the systematic
									process of structuring relationships, distributing resources,
									and administering power, operating simultaneously in ways that
									mutually reinforce or influence one another to shape
									opportunities that either advance health equity or exacerbate
									health inequities.
								</p>
								<span className='text-small text-altDark'>
									Daniel Dawes, 2020
								</span>
							</section>
							{/* SDOH */}
							<section className='w-full p-4 pl-0 md:w-1/2'>
								<h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
									Social determinants of health
								</h3>
								<p className='my-2 text-small leading-lhLoose'>
									The conditions in the environments in which people are born,
									live, learn, work, play, worship, and age that affect a wide
									range of health, functioning, and quality-of-life outcomes and
									risks.
								</p>
								<span className='text-small text-altDark'>
									Healthy People 2020, CDC
								</span>
							</section>
						</div>
					</div>
				</div>

				<div className='flex w-full flex-col flex-wrap items-center justify-center'>
					<div className='flex w-full flex-wrap justify-center py-5'>
						<section>
							<h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen'>
								Health equity learning
							</h3>
						</section>
						<div className='flex w-full flex-wrap justify-around py-5 text-left'>
							<div className='flex w-full flex-col items-start p-4 text-left md:w-3/4'>
								<iframe
									className='w-full rounded-md'
									height='633px'
									src='https://www.youtube.com/embed/mux1c73fJ78'
									title='YouTube video player - The Allegory of the Orchard'
									loading='lazy'
									allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
									allowFullScreen
								/>
								<h4 className='my-4 font-sansText text-smallHeader font-medium'>
									Learn about the Political Determinants of Health through the{' '}
									<b>Allegory of the Orchard</b>
								</h4>
								<p className='m-0 font-sansText text-title font-light'>
									Girding all health determinants is one that rarely gets
									addressed but which has power over all aspects of health:
									political determinants of health.
								</p>
							</div>
							<section className='w-full md:w-1/4'>
								<div className='flex w-full flex-col flex-wrap items-center justify-evenly'>
									<aside className='flex flex-col items-start p-4 text-left'>
										<iframe
											aria-label={`Jessica's Story Video`}
											className='md:h-44 xs:h-80 w-full rounded-md'
											src='https://www.youtube.com/embed/cmMutvgQIcU'
											title={`YouTube video player - Jessica's Story`}
											loading='lazy'
											allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
											allowFullScreen
										/>
										<h4 className='my-4 font-sansText text-title font-medium'>
											Jessica's Story
										</h4>
										<p className='m-0 font-light'>
											How political determinants of health operate and the
											impact they have on BIPOC communities.
										</p>
									</aside>
									<aside
										className='flex flex-col items-start p-4 text-left'
										aria-label='NCRN Information'
									>
										<a href={urlMap.ncrn} className='text-black no-underline'>
											<LazyLoad offset={300} height={200} once>
												<img
													className='md:h-44 sm:h-80 xs:h-40 w-full rounded-md'
													src='/img/graphics/NCRN.png'
													alt='Header for Morehouse School of Medicine National COVID-19 Resiliency Network'
												/>
											</LazyLoad>
											<h4 className='my-4 font-sansText text-title font-medium'>
												Morehouse School of Medicine National COVID-19
												Resiliency Network (NCRN)
											</h4>
											<p className='font-light'>
												We provide awareness and linkage to critical health
												information and services, helping families recover from
												difficulties that may have been caused or worsened by
												the Coronavirus (COVID-19) pandemic.
											</p>
										</a>
									</aside>
								</div>
							</section>
						</div>
					</div>

<<<<<<< HEAD
					<section className='bg-[#F0F1EF]/[0.8] py-16'>
=======
					<section className='bg-whiteSmoke80 py-16'>
>>>>>>> ab6067bd (updates UI in WIHE equity tab (#3500))
						<div className='mx-0 flex flex-wrap'>
							<div className='w-full mt-4 mb-16 '>
								<h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen'>
									News and stories
								</h3>
								<p className='text-text'>
									Read the{' '}
									<Link to={NEWS_PAGE_LINK}>
										latest news, posts, and stories
									</Link>{' '}
									related to health equity, or learn more from the articles
									below.
								</p>
							</div>
							<LazyLoad offset={300} height={700} once>
								<div className='grid gap-6'>
									{isLoading ? (
										<HetPostsLoading
											className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4'
											doPulse={!error}
											
										/>
									) : (
										<>
											<div className='grid md:grid-cols-2 gap-6 xs:grid-cols-1'>
												{NEWS_ARTICLES.slice(0, 2).map((article, index) => (
													<EquityTabNewsCard
														key={index}
														href={article.href}
														ariaLabel={article.ariaLabel}
														imgSrc={article.imgSrc}
														imgAlt={article.imgAlt}
														title={article.title}
														description={article.description}
														readMoreHref={article.readMoreHref}
													/>
												))}
											</div>
											<div className='grid md:grid-cols-3 gap-6 xs:grid-cols-1 mt-6'>
												{NEWS_ARTICLES.slice(2).map((article, index) => (
													<EquityTabNewsCard
														key={index}
														href={article.href}
														ariaLabel={article.ariaLabel}
														imgSrc={article.imgSrc}
														imgAlt={article.imgAlt}
														title={article.title}
														description={article.description}
														readMoreHref={article.readMoreHref}
													/>
												))}
											</div>
										</>
									)}
								</div>
							</LazyLoad>
						</div>
						<HetTextArrowLink
							link={NEWS_PAGE_LINK}
							linkText='View all articles'
							containerClassName='flex items-center justify-center mt-16 mx-auto '
							linkClassName='font-sansTitle text-smallestHeader'
						/>
					</section>
				</div>
			</div>

			<div className='flex w-full items-center justify-center py-12'>
				<section className='w-full md:w-5/6'>
					<FaqSection />
				</section>
			</div>
		</>
	)
<<<<<<< HEAD
}
=======
            <div className='w-full border-0 px-15p py-8 md:w-2/3 md:border-l md:border-solid md:px-16 md:py-28'>
              <header className='mb-10'>
                <h2
                  id='main'
                  className='mb-4 mt-0 text-left font-serif text-header font-light leading-lhNormal text-altGreen sm:text-bigHeader md:text-biggerHeader'
                >
                  What is Health Equity?
                </h2>
              </header>
              <p className='mb-4 mt-0 text-left font-sansText text-title font-normal leading-lhLoose'>
                <b>Health Equity</b> exists when all people, regardless of race,
                sex, sexual orientation, disability, socio-economic status,
                geographic location, or other societal constructs have fair and
                just access, opportunity, and resources to achieve their highest
                potential for health.
              </p>
              <p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
                Unfortunately, social and political determinants of health
                negatively affect many communities, their people, and their
                ability to lead healthy lives.
              </p>
              <p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
                <span className='text-small text-altDark'>
                  Health Equity Leadership & Exchange Network, 2020
                </span>
              </p>
              <div className='flex w-full flex-wrap items-start justify-between text-left'>
                {/* PDOH */}
                <section className='w-full p-4 pl-0 md:w-1/2'>
                  <h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
                    Political determinants of health
                  </h3>
                  <p className='my-2 text-small leading-lhLoose'>
                    The Political determinants of health involve the systematic
                    process of structuring relationships, distributing
                    resources, and administering power, operating simultaneously
                    in ways that mutually reinforce or influence one another to
                    shape opportunities that either advance health equity or
                    exacerbate health inequities.
                  </p>
                  <span className='text-small text-altDark'>
                    Daniel Dawes, 2020
                  </span>
                </section>
                {/* SDOH */}
                <section className='w-full p-4 pl-0 md:w-1/2'>
                  <h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
                    Social determinants of health
                  </h3>
                  <p className='my-2 text-small leading-lhLoose'>
                    The conditions in the environments in which people are born,
                    live, learn, work, play, worship, and age that affect a wide
                    range of health, functioning, and quality-of-life outcomes
                    and risks.
                  </p>
                  <span className='text-small text-altDark'>
                    Healthy People 2020, CDC
                  </span>
                </section>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col flex-wrap items-center justify-center'>
            <div className='flex w-full flex-wrap justify-center py-5'>
              <section>
                <h3 className='m-0 text-center font-serif text-header font-light leading-lhLoose text-altGreen sm:text-bigHeader md:text-biggerHeader'>
                  Health equity learning
                </h3>
              </section>
              <div className='flex w-full flex-wrap justify-around py-5 text-left'>
                <div className='flex w-full flex-col  items-start p-4 text-left md:w-3/4'>
                  <iframe
                    className='w-full rounded-md'
                    height='633px'
                    src='https://www.youtube.com/embed/mux1c73fJ78'
                    title='YouTube video player -
                          The Allegory of the Orchard'
                    loading='lazy'
                    allow='accelerometer; autoplay; clipboard-write;
                          encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
=======
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LazyLoad from 'react-lazyload';
import FaqSection from '../ui/FaqSection';
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading';
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink';
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes';
import { urlMap } from '../../utils/externalUrls';
import { EquityTabNewsCard } from './EquityTabNewsCard';

const NEWS_ARTICLES = [
  {
    href: "https://satcherinstitute.org/hetblog2/",
    ariaLabel: "Satcher Blog Post on Why Data Matters",
    imgSrc: "/img/stock/kid-gets-a-mask.png",
    imgAlt: "",
    title: "Why it matters that information on race, ethnicity, gender and disability are measured accurately and completely",
    description: "Why ongoing data on health and well-being metrics could be used in targeting federal resources and programs to address inequities due to social and economic factors.",
    readMoreHref: "https://satcherinstitute.org/hetblog2/"
  },
  {
    href: "https://satcherinstitute.org/hetblog3/",
    ariaLabel: "Satcher Blog Post on Health Equity Data",
    imgSrc: "/img/stock/girls-studying.jpg",
    imgAlt: "",
    title: "How can we use data to inform practices to advance health equity?",
    description: "In public health, much of our work depends on having accurate data, so we know what's happening both on the ground and at a population level.",
    readMoreHref: "https://satcherinstitute.org/hetblog3/"
  },
  {
    href: "https://www.scientificamerican.com/article/data-and-technology-can-help-us-make-progress-on-covid-inequities/",
    ariaLabel: "Read Scientific American Article",
    imgSrc: "/img/stock/filling-in-forms.png",
    imgAlt: "",
    title: "Data and technology can help us make progress on COVID inequities"
  },
  {
    href: "https://satcherinstitute.github.io/analysis/cdc_case_data",
    ariaLabel: "Satcher Post on COVID Data Completeness",
    imgSrc: "/img/stock/kids-ukulele.png",
    imgAlt: "",
    title: "How complete are the CDC's COVID-19 case surveillance datasets for race/ethnicity at the state and county levels?"
  },
  {
    href: "https://www.kennedysatcher.org/blog/the-mental-fitness-of-our-children",
    ariaLabel: "Kennedy Satcher Article: The Mental Fitness of Our Children",
    imgSrc: "/img/graphics/laptop-HET.png",
    imgAlt: "",
    title: "The mental fitness of our children"
  }
];


<<<<<<< HEAD
function NewsSection({ isLoading, error, numberOfArticlePreviews }) {
  return (
    <section className="flex w-full flex-wrap items-center justify-center">
      <div className="mx-0 flex flex-wrap py-24">
        <div className="w-full">
          <h3 className="m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen">
            News and stories
          </h3>
        </div>
        <div className="w-full">
          <p className="mt-4 mb-16 text-text">
            Read the{" "}
            <Link to={NEWS_PAGE_LINK}>
              latest news, posts, and stories
            </Link>{" "}
            related to health equity, or learn more from the articles
            below.
          </p>
        </div>
        <div className="w-full">
          <div className="grid">
            <LazyLoad offset={300} height={700} once>
              <div className='w-full'>
                {isLoading ? (
                  <HetPostsLoading
                    className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4'
                    doPulse={!error}
                    numberLoading={numberOfArticlePreviews}
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
                  />
                ) : (
                  NEWS_ARTICLES.map((article, index) => (
                    <EquityTabNewsCard
                      key={index}
                      href={article.href}
                      ariaLabel={article.ariaLabel}
                      imgSrc={article.imgSrc}
                      imgAlt={article.imgAlt}
                      title={article.title}
                      description={article.description}
                      readMoreHref={article.readMoreHref}
                    />
                  ))
                )}
              </div>
            </LazyLoad>
          </div>
        </div>
      </div>
    </section>
  );
}
<<<<<<< HEAD
export default EquityTab
>>>>>>> eb0c33fa (rm unsuable how do i join the movement section with links to fellowship, newsletter, helping community and bottom border of faq section)
=======
=======
>>>>>>> d543211e (updates ckd nightly test, rm bottom border of FAQ section)

export default function EquityTab({
	isLoading,
	error,
	numberOfArticlePreviews,
}) {
=======
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)

export default function EquityTab() {
	const { isLoading, error, data }: any = useQuery(
		ARTICLES_KEY_4,
		fetchLandingPageNewsData,
		REACT_QUERY_OPTIONS,
	  )
	return (
		<>
			<Helmet>
				<title>What is Health Equity? - Health Equity Tracker</title>
			</Helmet>
			<div className='m-auto flex w-full max-w-lgXl flex-wrap'>
				<div className='flex w-full items-center justify-center border-0 border-b border-solid border-borderColor'>
					<figure className='mx-auto mt-0 hidden p-2 text-left md:block md:w-1/3'>
						<LazyLoad
							offset={300}
							height={760}
							once
							className='flex justify-center'
						>
							<img
								alt=''
								className='m-5 h-auto w-9/12 max-w-equityLogo rounded-md'
								src='/img/stock/woman-in-wheelchair-with-tea.png'
							/>
						</LazyLoad>
					</figure>
					<div className='w-full border-0 px-15 py-8 md:w-2/3 md:border-l md:border-solid md:px-16 md:py-28'>
						<header className='mb-10'>
							<h2
								id='main'
								className='mb-4 mt-0 text-left font-serif text-header font-light leading-lhNormal text-altGreen sm:text-bigHeader md:text-biggerHeader'
							>
								What is Health Equity?
							</h2>
						</header>
						<p className='mb-4 mt-0 text-left font-sansText text-title font-normal leading-lhLoose'>
							<b>Health Equity</b> exists when all people, regardless of race,
							sex, sexual orientation, disability, socio-economic status,
							geographic location, or other societal constructs have fair and
							just access, opportunity, and resources to achieve their highest
							potential for health.
						</p>
						<p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
							Unfortunately, social and political determinants of health
							negatively affect many communities, their people, and their
							ability to lead healthy lives.
						</p>
						<p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
							<span className='text-small text-altDark'>
								Health Equity Leadership & Exchange Network, 2020
							</span>
						</p>
						<div className='flex w-full flex-wrap items-start justify-between text-left'>
							{/* PDOH */}
							<section className='w-full p-4 pl-0 md:w-1/2'>
								<h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
									Political determinants of health
								</h3>
								<p className='my-2 text-small leading-lhLoose'>
									The Political determinants of health involve the systematic
									process of structuring relationships, distributing resources,
									and administering power, operating simultaneously in ways that
									mutually reinforce or influence one another to shape
									opportunities that either advance health equity or exacerbate
									health inequities.
								</p>
								<span className='text-small text-altDark'>
									Daniel Dawes, 2020
								</span>
							</section>
							{/* SDOH */}
							<section className='w-full p-4 pl-0 md:w-1/2'>
								<h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
									Social determinants of health
								</h3>
								<p className='my-2 text-small leading-lhLoose'>
									The conditions in the environments in which people are born,
									live, learn, work, play, worship, and age that affect a wide
									range of health, functioning, and quality-of-life outcomes and
									risks.
								</p>
								<span className='text-small text-altDark'>
									Healthy People 2020, CDC
								</span>
							</section>
						</div>
					</div>
				</div>

				<div className='flex w-full flex-col flex-wrap items-center justify-center'>
					<div className='flex w-full flex-wrap justify-center py-5'>
						<section>
							<h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen'>
								Health equity learning
							</h3>
						</section>
						<div className='flex w-full flex-wrap justify-around py-5 text-left'>
							<div className='flex w-full flex-col items-start p-4 text-left md:w-3/4'>
								<iframe
									className='w-full rounded-md'
									height='633px'
									src='https://www.youtube.com/embed/mux1c73fJ78'
									title='YouTube video player - The Allegory of the Orchard'
									loading='lazy'
									allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
									allowFullScreen
								/>
								<h4 className='my-4 font-sansText text-smallHeader font-medium'>
									Learn about the Political Determinants of Health through the{' '}
									<b>Allegory of the Orchard</b>
								</h4>
								<p className='m-0 font-sansText text-title font-light'>
									Girding all health determinants is one that rarely gets
									addressed but which has power over all aspects of health:
									political determinants of health.
								</p>
							</div>
							<section className='w-full md:w-1/4'>
								<div className='flex w-full flex-col flex-wrap items-center justify-evenly'>
									<aside className='flex flex-col items-start p-4 text-left'>
										<iframe
											aria-label='Jessica's Story Video'
											className='h-44 w-full rounded-md'
											src='https://www.youtube.com/embed/cmMutvgQIcU'
											title='YouTube video player - Jessica's Story'
											loading='lazy'
											allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
											allowFullScreen
										/>
										<h4 className='my-4 font-sansText text-title font-medium'>
											Jessica's Story
										</h4>
										<p className='m-0 font-light'>
											How political determinants of health operate and the
											impact they have on BIPOC communities.
										</p>
									</aside>
									<aside
										className='flex flex-col items-start p-4 text-left'
										aria-label='NCRN Information'
									>
										<a href={urlMap.ncrn} className='text-black no-underline'>
											<LazyLoad offset={300} height={200} once>
												<img
													className='h-44 w-full rounded-md'
													src='/img/graphics/NCRN.png'
													alt='Header for Morehouse School of Medicine National COVID-19 Resiliency Network'
												/>
											</LazyLoad>
											<h4 className='my-4 font-sansText text-title font-medium'>
												Morehouse School of Medicine National COVID-19
												Resiliency Network (NCRN)
											</h4>
											<p className='font-light'>
												We provide awareness and linkage to critical health
												information and services, helping families recover from
												difficulties that may have been caused or worsened by
												the Coronavirus (COVID-19) pandemic.
											</p>
										</a>
									</aside>
								</div>
							</section>
						</div>
					</div>

					<section className='bg-[#F0F1EF]/[0.8] py-16'>
						<div className='mx-0 flex flex-wrap'>
							<div className='w-full mt-4 mb-16 '>
								<h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen'>
									News and stories
								</h3>
								<p className='text-text'>
									Read the{' '}
									<Link to={NEWS_PAGE_LINK}>
										latest news, posts, and stories
									</Link>{' '}
									related to health equity, or learn more from the articles
									below.
								</p>
							</div>
							<LazyLoad offset={300} height={700} once>
								<div className='grid gap-6'>
									{isLoading ? (
										<HetPostsLoading
											className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4'
											doPulse={!error}
											numberLoading={numberOfArticlePreviews}
										/>
									) : (
										<>
											<div className='grid md:grid-cols-2 gap-6 xs:grid-cols-1'>
												{NEWS_ARTICLES.slice(0, 2).map((article, index) => (
													<EquityTabNewsCard
														key={index}
														href={article.href}
														ariaLabel={article.ariaLabel}
														imgSrc={article.imgSrc}
														imgAlt={article.imgAlt}
														title={article.title}
														description={article.description}
														readMoreHref={article.readMoreHref}
													/>
												))}
											</div>
											<div className='grid md:grid-cols-3 gap-6 xs:grid-cols-1 mt-6'>
												{NEWS_ARTICLES.slice(2).map((article, index) => (
													<EquityTabNewsCard
														key={index}
														href={article.href}
														ariaLabel={article.ariaLabel}
														imgSrc={article.imgSrc}
														imgAlt={article.imgAlt}
														title={article.title}
														description={article.description}
														readMoreHref={article.readMoreHref}
													/>
												))}
											</div>
										</>
									)}
								</div>
							</LazyLoad>
						</div>
						<HetTextArrowLink
							link={NEWS_PAGE_LINK}
							linkText='View all articles'
							containerClassName='flex items-center justify-center mt-16 mx-auto '
							linkClassName='font-sansTitle text-smallestHeader'
						/>
					</section>
				</div>
			</div>

			<div className='flex w-full items-center justify-center py-12'>
				<section className='w-full md:w-5/6'>
					<FaqSection />
				</section>
			</div>
		</>
<<<<<<< HEAD
	);
}
>>>>>>> 19fdfc00 (begins refactoring equity tab and adds new equitytabnewscard component)
=======
	)
}
>>>>>>> 7d959343 (reformats quotes and semicolons, moves equity tab news section data to separate component)
=======
}
>>>>>>> 01de16d0 (includes new unreleased equity tab files, adds routeconfigs file for tab nav, updates internal routes, updates ckd playwright test)
