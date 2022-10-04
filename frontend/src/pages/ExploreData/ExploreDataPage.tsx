import { Grid } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { STATUS } from "react-joyride";
import Carousel from "react-material-ui-carousel";
import { Fips } from "../../data/utils/Fips";
import ReportProvider from "../../reports/ReportProvider";
import {
  getMadLibPhraseText,
  getMadLibWithUpdatedValue,
  getSelectedConditions,
  insertOptionalThe,
  MadLib,
  MadLibId,
  MADLIB_LIST,
  PhraseSegment,
  PhraseSelections,
} from "../../utils/MadLibs";
import {
  DATA_TYPE_1_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  parseMls,
  psSubscribe,
  setParameters,
  SHOW_ONBOARDING_PARAM,
  stringifyMls,
  useSearchParams,
} from "../../utils/urlutils";
import styles from "./ExploreDataPage.module.scss";
import OptionsSelector from "./OptionsSelector";
import { useLocation } from "react-router-dom";
import { srSpeak } from "../../utils/a11yutils";
import { urlMap } from "../../utils/externalUrls";
import { VariableConfig } from "../../data/config/MetricConfig";
import { INCARCERATION_IDS } from "../../data/variables/IncarcerationProvider";
import useScrollPosition from "../../utils/hooks/useScrollPosition";
import { useHeaderScrollMargin } from "../../utils/hooks/useHeaderScrollMargin";

const Onboarding = React.lazy(() => import("./Onboarding"));

const EXPLORE_DATA_ID = "main";

function ExploreDataPage() {
  const location: any = useLocation();
  const [showStickyLifeline, setShowStickyLifeline] = useState(false);
  const [showIncarceratedChildrenAlert, setShowIncarceratedChildrenAlert] =
    useState(false);

  // Set up initial mad lib values based on defaults and query params
  const params = useSearchParams();

  // swap out old variable ids for backwards compatibility of outside links
  const foundIndex = MADLIB_LIST.findIndex(
    (madlib) => madlib.id === params[MADLIB_PHRASE_PARAM]
  );
  const initialIndex = foundIndex !== -1 ? foundIndex : 0;
  let defaultValuesWithOverrides = MADLIB_LIST[initialIndex].defaultSelections;
  if (params[MADLIB_SELECTIONS_PARAM]) {
    params[MADLIB_SELECTIONS_PARAM].split(",").forEach((override) => {
      const [phraseSegmentIndex, value] = override.split(":");
      let phraseSegments: PhraseSegment[] = MADLIB_LIST[initialIndex].phrase;
      if (
        Object.keys(phraseSegments).includes(phraseSegmentIndex) &&
        Object.keys(phraseSegments[Number(phraseSegmentIndex)]).includes(value)
      ) {
        defaultValuesWithOverrides[Number(phraseSegmentIndex)] = value;
      }
    });
  }

  const [madLib, setMadLib] = useState<MadLib>({
    ...MADLIB_LIST[initialIndex],
    activeSelections: defaultValuesWithOverrides,
  });

  useEffect(() => {
    const readParams = () => {
      let index = getParameter(MADLIB_PHRASE_PARAM, 0, (str) => {
        return MADLIB_LIST.findIndex((ele) => ele.id === str);
      });
      let selection = getParameter(
        MADLIB_SELECTIONS_PARAM,
        MADLIB_LIST[index].defaultSelections,
        parseMls
      );

      setMadLib({
        ...MADLIB_LIST[index],
        activeSelections: selection,
      });
    };
    const psSub = psSubscribe(readParams, "explore");

    readParams();

    return () => {
      if (psSub) {
        psSub.unsubscribe();
      }
    };
  }, []);

  const setMadLibWithParam = (ml: MadLib) => {
    setParameters([
      {
        name: MADLIB_SELECTIONS_PARAM,
        value: stringifyMls(ml.activeSelections),
      },
      { name: DATA_TYPE_1_PARAM, value: null },
      { name: DEMOGRAPHIC_PARAM, value: null },
    ]);
    setMadLib(ml);
  };

  // Set up warm welcome onboarding behaviors
  const [cookies, setCookie] = useCookies();
  let showOnboarding = cookies.skipOnboarding !== "true";
  if (params[SHOW_ONBOARDING_PARAM] === "true") {
    showOnboarding = true;
  }
  if (params[SHOW_ONBOARDING_PARAM] === "false") {
    showOnboarding = false;
  }

  // if there is an incoming #hash; bypass the warm welcome entirely
  if (location.hash !== "") showOnboarding = false;

  const [activelyOnboarding, setActivelyOnboarding] =
    useState<boolean>(showOnboarding);
  const onboardingCallback = (data: any) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      setActivelyOnboarding(false);
      const expirationDate = new Date();
      // Expiration date set for a year from now
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      setCookie("skipOnboarding", true, { path: "/", expires: expirationDate });
    }
  };

  // Set up sticky madlib behavior
  const [sticking, setSticking] = useState<boolean>(false);
  useScrollPosition(
    ({ pageYOffset, stickyBarOffsetFromTop }) => {
      const topOfCarousel = pageYOffset > stickyBarOffsetFromTop;
      if (topOfCarousel) setSticking(true);
      else setSticking(false);
    },
    [sticking],
    300
  );

  useEffect(() => {
    if (activelyOnboarding) {
      return;
    }
  }, [activelyOnboarding]);

  // calculate page size to determine if mobile or not
  const isSingleColumn = (madLib.id as MadLibId) === "disparity";

  const handleCarouselChange = (carouselMode: number) => {
    // Extract values from the CURRENT madlib
    const var1 = madLib.activeSelections[1];
    const geo1 =
      madLib.id === "comparevars"
        ? madLib.activeSelections[5]
        : madLib.activeSelections[3];

    // default non-duplicate settings for compare modes
    const var2 = var1 === "covid" ? "covid_vaccinations" : "covid";
    const geo2 = geo1 === "00" ? "13" : "00"; // default to US or Georgia

    // Construct UPDATED madlib based on the future carousel Madlib shape
    let updatedMadLib: PhraseSelections = { 1: var1, 3: geo1 }; // disparity "Investigate Rates"
    if (carouselMode === 1) updatedMadLib = { 1: var1, 3: geo1, 5: geo2 }; // comparegeos "Compare Rates"
    if (carouselMode === 2) updatedMadLib = { 1: var1, 3: var2, 5: geo1 }; // comparevars "Explore Relationships"

    setMadLib({
      ...MADLIB_LIST[carouselMode],
      activeSelections: updatedMadLib,
    });
    setParameters([
      {
        name: MADLIB_SELECTIONS_PARAM,
        value: stringifyMls(updatedMadLib),
      },
      {
        name: MADLIB_PHRASE_PARAM,
        value: MADLIB_LIST[carouselMode].id,
      },
    ]);
    location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* on any changes to the madlib settings */
  useEffect(() => {
    // A11y - create then delete an invisible alert that the report mode has changed
    srSpeak(`Now viewing report: ${getMadLibPhraseText(madLib)}`);

    // hide/display the sticky suicide lifeline link based on selected condition
    setShowStickyLifeline(
      getSelectedConditions(madLib).some(
        (condition: VariableConfig) => condition?.variableId === "suicide"
      )
    );

    setShowIncarceratedChildrenAlert(
      getSelectedConditions(madLib).some((condition: VariableConfig) =>
        INCARCERATION_IDS.includes(condition?.variableId)
      )
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [madLib]);

  const headerScrollMargin = useHeaderScrollMargin(
    "onboarding-start-your-search",
    sticking,
    [madLib, showIncarceratedChildrenAlert, showStickyLifeline]
  );

  return (
    <>
      <Onboarding
        callback={onboardingCallback}
        activelyOnboarding={activelyOnboarding}
      />

      <h2 className={styles.ScreenreaderTitleHeader}>
        {getMadLibPhraseText(madLib)}
      </h2>
      <div id={EXPLORE_DATA_ID} tabIndex={-1} className={styles.ExploreData}>
        <div
          className={styles.CarouselContainer}
          id="onboarding-start-your-search"
        >
          <Carousel
            className={`Carousel ${styles.Carousel}`}
            NextIcon={
              <NavigateNextIcon
                aria-hidden="true"
                id="onboarding-madlib-arrow"
              />
            }
            timeout={200}
            autoPlay={false}
            indicators={true}
            indicatorIconButtonProps={{
              "aria-label": "Report Type",
              style: { padding: "4px" },
            }}
            activeIndicatorIconButtonProps={{
              "aria-label": "Current Selection: Report Type",
            }}
            // ! TODO We really should be able to indicate Forward/Backward vs just "Change"
            navButtonsProps={{
              "aria-label": "Change Report Type",
            }}
            animation="slide"
            navButtonsAlwaysVisible={true}
            index={initialIndex}
            onChange={handleCarouselChange}
          >
            {/* carousel settings same length as MADLIB_LIST, but fill each with madlib constructed earlier */}
            {MADLIB_LIST.map((madLibShape) => (
              <CarouselMadLib
                madLib={madLib}
                setMadLib={setMadLibWithParam}
                key={madLibShape.id}
              />
            ))}
          </Carousel>
          {showStickyLifeline && (
            <p className={styles.LifelineSticky}>
              <a href={urlMap.lifeline}>988lifeline.org</a>
            </p>
          )}
        </div>
        <div className={styles.ReportContainer}>
          <ReportProvider
            isSingleColumn={isSingleColumn}
            madLib={madLib}
            selectedConditions={getSelectedConditions(madLib)}
            showLifeLineAlert={showStickyLifeline}
            showIncarceratedChildrenAlert={showIncarceratedChildrenAlert}
            setMadLib={setMadLibWithParam}
            isScrolledToTop={!sticking}
            headerScrollMargin={headerScrollMargin}
          />
        </div>
      </div>
    </>
  );
}

function CarouselMadLib(props: {
  madLib: MadLib;
  setMadLib: (updatedMadLib: MadLib) => void;
}) {
  // TODO - this isn't efficient, these should be stored in an ordered way
  function getOptionsFromPhraseSegement(
    phraseSegment: PhraseSegment
  ): Fips[] | string[][] {
    // check first option to tell if phraseSegment is FIPS or CONDITIONS
    return isNaN(Object.keys(phraseSegment)[0] as any)
      ? Object.entries(phraseSegment).sort((a, b) => a[0].localeCompare(b[0]))
      : Object.keys(phraseSegment)
          .sort((a: string, b: string) => {
            if (a.length === b.length) {
              return a.localeCompare(b);
            }
            return b.length > a.length ? -1 : 1;
          })
          .map((fipsCode) => new Fips(fipsCode));
  }

  const location = useLocation();

  return (
    <Grid container justifyContent="center" alignItems="center">
      <div className={styles.CarouselItem}>
        {props.madLib.phrase.map(
          (phraseSegment: PhraseSegment, index: number) => (
            <React.Fragment key={index}>
              {typeof phraseSegment === "string" ? (
                <span>
                  {phraseSegment}
                  {insertOptionalThe(props.madLib.activeSelections, index)}
                </span>
              ) : (
                <OptionsSelector
                  key={index}
                  value={props.madLib.activeSelections[index]}
                  onOptionUpdate={(fipsCode: string) => {
                    props.setMadLib(
                      getMadLibWithUpdatedValue(props.madLib, index, fipsCode)
                    );
                    location.hash = "";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  options={getOptionsFromPhraseSegement(phraseSegment)}
                />
              )}
            </React.Fragment>
          )
        )}
      </div>
    </Grid>
  );
}

export default ExploreDataPage;
