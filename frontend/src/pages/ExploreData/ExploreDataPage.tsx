import { Grid, useMediaQuery, useTheme } from "@material-ui/core";
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
  MadLib,
  MadLibId,
  MADLIB_LIST,
  PhraseSegment,
  PhraseSelections,
} from "../../utils/MadLibs";
import {
  getParameter,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  parseMls,
  psSubscribe,
  setParameter,
  setParameters,
  SHOW_ONBOARDING_PARAM,
  stringifyMls,
  useSearchParams,
} from "../../utils/urlutils";
import { WHAT_DATA_ARE_MISSING_ID } from "../../utils/internalRoutes";
import styles from "./ExploreDataPage.module.scss";
import { Onboarding } from "./Onboarding";
import OptionsSelector from "./OptionsSelector";
import { useLocation } from "react-router-dom";
import { srSpeak } from "../../utils/a11yutils";
import { urlMap } from "../../utils/externalUrls";
import { VariableConfig } from "../../data/config/MetricConfig";
import { BJS_VARIABLE_IDS } from "../../data/variables/BjsProvider";

const EXPLORE_DATA_ID = "main";

function ExploreDataPage() {
  // handle incoming link to MISSING DATA sections
  const location: any = useLocation();
  const doScrollToData: boolean =
    location?.hash === `#${WHAT_DATA_ARE_MISSING_ID}`;

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
    setParameter(MADLIB_SELECTIONS_PARAM, stringifyMls(ml.activeSelections));
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
  useEffect(() => {
    if (activelyOnboarding) {
      return;
    }
    const header = document.getElementById(EXPLORE_DATA_ID);
    const stickyBarOffsetFromTop: number = header ? header.offsetTop : 1;
    const scrollCallBack: any = window.addEventListener("scroll", () => {
      if (window.pageYOffset > stickyBarOffsetFromTop) {
        if (header) {
          header.classList.add(styles.Sticky);
        }
        setSticking(true);
      } else {
        if (header) {
          header.classList.remove(styles.Sticky);
        }
        setSticking(false);
      }
    });
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };
  }, [activelyOnboarding]);

  // calculate page size to determine if mobile or not
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("sm"));
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
  };

  /* on any changes to the madlib settings */
  useEffect(() => {
    // scroll browser screen to top
    window.scrollTo({ top: 0, behavior: "smooth" });

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
        BJS_VARIABLE_IDS.includes(condition?.variableId)
      )
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [madLib]);

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
            className={styles.Carousel}
            NextIcon={
              <NavigateNextIcon
                aria-hidden="true"
                id="onboarding-madlib-arrow"
              />
            }
            timeout={200}
            autoPlay={false}
            indicators={!sticking || !pageIsWide}
            indicatorIconButtonProps={{
              "aria-label": "Report Type",
              style: { padding: "4px" },
            }}
            activeIndicatorIconButtonProps={{
              "aria-label": "Current Selection: Report Type",
            }}
            // ! TODO We really should be able to indicate Forward/Backward vs just "Switch"
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
              <a href={urlMap.lifeline}>suicidepreventionlifeline.org</a>
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
            doScrollToData={doScrollToData}
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

  return (
    <Grid container justifyContent="center" alignItems="center">
      <div className={styles.CarouselItem}>
        {props.madLib.phrase.map(
          (phraseSegment: PhraseSegment, index: number) => (
            <React.Fragment key={index}>
              {typeof phraseSegment === "string" ? (
                <span>{phraseSegment}</span>
              ) : (
                <OptionsSelector
                  key={index}
                  value={props.madLib.activeSelections[index]}
                  onOptionUpdate={(fipsCode: string) =>
                    props.setMadLib(
                      getMadLibWithUpdatedValue(props.madLib, index, fipsCode)
                    )
                  }
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
