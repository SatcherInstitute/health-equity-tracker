import {
  ARTICLES_KEY_4,
  fetchLandingPageNewsData,
  REACT_QUERY_OPTIONS,
} from "../../utils/blogUtils";
import {
  EXPLORE_DATA_PAGE_LINK,
  NEWS_PAGE_LINK,
  WARM_WELCOME_DEMO_SETTING,
} from "../../utils/internalRoutes";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";
import NewsPreviewCard from "../News/NewsPreviewCard";
import { useQuery } from "react-query";
import type { Article } from "../News/NewsPage";
import { usePrefersReducedMotion } from "../../utils/hooks/usePrefersReducedMotion";
import HetBigCTA from "../../styles/HetComponents/HetBigCTA";
import { useIsBreakpointAndUp } from "../../utils/hooks/useIsBreakpointAndUp";
import HetPostsLoading from "../../styles/HetComponents/HetPostsLoading";
import TextLink from "../../reports/ui/TextLink";
import MadLibAnimation from "../../reports/ui/MadLibAnimation";

function LandingPage() {
  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY_4,
    fetchLandingPageNewsData,
    REACT_QUERY_OPTIONS
  );

  const isSm = useIsBreakpointAndUp("sm");
  const isMd = useIsBreakpointAndUp("md");
  const isLg = useIsBreakpointAndUp("lg");

  let numberOfArticlePreviews = 1;
  if (isSm) numberOfArticlePreviews = 2;
  if (isMd) numberOfArticlePreviews = 3;
  if (isLg) numberOfArticlePreviews = 4;

  const recentArticles = data?.data.slice(0, numberOfArticlePreviews);
  const prefersReducedMotion = usePrefersReducedMotion();

  interface ListItemProps {
    title: string;
    description: string;
    videoSrc?: string;
    iframeSrc?: string;
    itemNumber?: number;
  }

  function ListItem({
    title,
    description,
    videoSrc,
    iframeSrc,
    itemNumber,
  }: ListItemProps) {
    return (
      <li className="p-16 px-8 sm:p-8 xs:py-2 xs:px-4 list-none flex xl:flex-row lg:flex-row sm:flex-col xs:flex-col items-center justify-around rounded-xl shadow-raised-tighter bg-white mx-24 min-h-[45vh] min-w-[80vw] w-auto max-w-[80vw] sticky top-[0]">
        <div className="flex flex-col justify-between w-1/3 mx-4 md:w-auto sm:w-auto xs:w-auto">
          <p className="font-sansTitle text-small font-bold text-left text-altGreen">
            {itemNumber}/4
          </p>
          <div className="w-full min-w-1/2 mb-4">
            <h4 className="font-sansTitle text-smallestHeader xs:text-title font-medium md:text-left my-2">
              {title}
            </h4>
            <p className="md:text-left mb-8 sm:text-small xs:text-small xs:mb-4">
              {description}
            </p>
            <TextLink
              link={`${EXPLORE_DATA_PAGE_LINK}${WARM_WELCOME_DEMO_SETTING}`}
              linkText="Take a guided tour"
            />
          </div>
        </div>
        <div className="w-full h-auto">
          {iframeSrc ? (
            <iframe
              className="min-h-[480px] w-full rounded-md"
              src={iframeSrc}
              title="YouTube video player"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <LazyLoad offset={300} once>
              <video
                autoPlay={!prefersReducedMotion}
                loop
                muted
                playsInline
                className="w-full p-2.5"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            </LazyLoad>
          )}
        </div>
      </li>
    );
  }


  return (
    <main className="relative">
      <Helmet>
        <title>Home - Health Equity Tracker</title>
        <link rel="preload" as="image" href="/img/stock/family-laughing.png" />
      </Helmet>

      <h2 className="sr-only">Home Page</h2>

      <section className="relative overflow-hidden px-56 py-16 md:px-24 sm:px-16 xs:px-16 min-h-5/6">
        <img
          src="/img/graphics/het-hero.png"
          alt="various charts from the health equity tracker"
          className="z-0 absolute max-w-4xl top-0 mx-24 bottom-0 right-0 float-right opacity-35 md:opacity-15 sm:opacity-15 xs:opacity-15"
        ></img>
        <div className="p-0 m-0 relative lg:w-1/2 md:w-full sm:w-full text-left">
          <h1 className="leading-lhSomeSpace font-serif text-black text-bigHeader font-medium text-left mt-4 mb-0 xs:text-header">
            Where will the <br />
            <span className="text-altGreen">Health Equity Tracker</span>
            <br /> take you?
          </h1>
          <HetBigCTA id="landingPageCTA" href={EXPLORE_DATA_PAGE_LINK}>
            Explore the data
          </HetBigCTA>
          <div className="border-solid border-timberwolf border-l-2 border-0 py-0 pl-2 z-1">
            <p className="py-0 my-0 z-1">
              Data sourced from major public health agencies
            </p>
          </div>
          <div className="flex py-4 flex-wrap gap-6 justify-start w-full">
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_cdc.png"
                alt="US CDC logo"
              ></img>
            </div>
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_census.png"
                alt="US Census logo"
              ></img>
            </div>
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_bjs.png"
                alt="BJS logo"
              ></img>
            </div>
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_cawp.png"
                alt="CAWP logo"
              ></img>
            </div>
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_ahr.png"
                alt="AHR logo"
              ></img>
            </div>
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_cms.png"
                alt="CMS logo"
              ></img>
            </div>
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_vera.png"
                alt="VERA logo"
              ></img>
            </div>
            <div className="max-h-4">
              <img
                className="h-4"
                src="/img/graphics/logo_kff.png"
                alt="Kaiser Family Foundation logo"
              ></img>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-wrap items-center justify-center">
        <div className="flex md:flex xs:block sm:block items-center justify-center p-16 bg-[#F0F1EF]/[0.8] mx-auto my-0 w-full min-h-[60vh] h-auto space-8 lg:space-24">
          <img
            src="/img/graphics/banner.png"
            className="md:w-2/5 w-full"
            alt="phone and laptop mockups displaying the health equity tracker"
          />

          <div className="flex w-full flex-col justify-center items-center md:block sm:block">
            <h2
              id="main"
              className="m-0 font-sansTitle text-bigHeader font-bold leading-lhModalHeading text-altGreen text-center xs:text-header"
            >
              Advancing Health Justice
            </h2>

            <p className="lg:text-left lg:text-title mt-4 mb-16 text-title">
              The Health Equity Tracker from the Satcher Health Leadership
              Institute aims to address health disparities in the United States
              by identifying at-risk populations and highlighting data
              inequities. By providing policymakers, community leaders, and
              researchers the data they need to make informed decisions, this
              scalable, feature-rich platform supports efforts to achieve health
              equity and justice for all.
            </p>
          </div >
        </div >
      </section >

      <section className="py-8 ">
        <div className=" py-0 m-0">
          <div className="flex flex-col items-center justify-center m-0 p-0 ">
            <div className="w-full">
              <h3 className="m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen">
                How do I use the Health Equity Tracker?
              </h3>
            </div>

            <p className="text-text">
              Scroll down to learn more about the platform.
            </p>
            <MadLibAnimation />
          </div>

          <div className="flex flex-col items-center justify-center h-[55vh] min-h-[55vh] overflow-y-auto relative">
            <ul className="w-full flex flex-col items-center justify-center p-0 scrollbar-hide absolute top-[0] ">
              <ListItem
                title="Take a tour of the data"
                description="New to the Health Equity Tracker? Watch a short video demo that highlights major features of the platform."
                iframeSrc="https://www.youtube.com/embed/XBoqT9Jjc8w"
                videoSrc={undefined}
                itemNumber={1}
              />

              <ListItem
                title="Search by completing the sentence"
                description="Select topics and locations you’re interested in to complete the sentence and explore the data."
                videoSrc="videos/search-by.mp4"
                iframeSrc={undefined}
                itemNumber={2}
              />

              <ListItem
                title="Use filters to go deeper"
                description="Where available, the tracker offers breakdowns by race and ethnicity, sex, and age."
                videoSrc="videos/filters.mp4"
                iframeSrc={undefined}
                itemNumber={3}
              />

              <ListItem
                title="Explore maps and graphs"
                description="The interactive maps and graphs are a great way to investigate the data more closely. If a state or county is gray, that means there’s no data currently available."
                videoSrc="videos/explore-map.mp4"
                iframeSrc={undefined}
                itemNumber={4}
              />
            </ul>
          </div>
        </div>
        <div className="mt-8">
          <HetBigCTA href={EXPLORE_DATA_PAGE_LINK}>Explore the data</HetBigCTA>
        </div>
      </section>

      <section className="flex w-full flex-wrap items-center justify-center">
        <div className="flex flex-wrap px-56 py-24 md:px-32 sm:px-24 xs:px-16">
          <div className="w-full">
            <h3 className="m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen">
              Recent news
            </h3>
          </div>
          <div className="w-full">
            <p className="mt-4 mb-16 text-text">
              Stories and updates from Morehouse School of Medicine and beyond
            </p>
          </div>
          <div className="w-full">
            <div className="flex flex-wrap px-4 ">
              {recentArticles && !isLoading ? (
                recentArticles.map((article: Article) => {
                  return (
                    <div
                      key={article.id}
                      className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                    >
                      <NewsPreviewCard article={article} />
                    </div>
                  );
                })
              ) : (
                <HetPostsLoading
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                  doPulse={!error}
                  numberLoading={numberOfArticlePreviews}
                />
              )}
            </div>
            <div>
              <TextLink
                link={NEWS_PAGE_LINK}
                linkText="View all articles"
                containerClassName="flex items-center justify-center mt-16 mx-auto "
                linkClassName="font-sansTitle text-smallestHeader"
              />
            </div >
          </div >
        </div >
      </section >
    </main >
  );
}

export default LandingPage;
