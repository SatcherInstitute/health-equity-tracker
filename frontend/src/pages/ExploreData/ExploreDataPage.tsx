import React, { useState, useEffect } from "react";
import Carousel from "react-material-ui-carousel";
import { Grid } from "@material-ui/core";
import {
  MADLIB_LIST,
  MadLib,
  PhraseSegment,
  getMadLibWithUpdatedValue,
} from "../../utils/MadLibs";
import { Fips } from "../../data/utils/Fips";
import styles from "./ExploreDataPage.module.scss";
import {
  clearSearchParams,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  useSearchParams,
} from "../../utils/urlutils";
import ReportProvider from "../../reports/ReportProvider";
import OptionsSelector from "./OptionsSelector";
import Joyride, { STATUS } from "react-joyride";

function ExploreDataPage() {
  const params = useSearchParams();
  useEffect(() => {
    // TODO - it would be nice to have the params stay and update when selections are made
    // Until then, it's best to just clear them so they can't become mismatched
    clearSearchParams([MADLIB_PHRASE_PARAM, MADLIB_SELECTIONS_PARAM]);
  }, []);

  const foundIndex = MADLIB_LIST.findIndex(
    (madlib) => madlib.id === params[MADLIB_PHRASE_PARAM]
  );
  const initalIndex = foundIndex !== -1 ? foundIndex : 0;
  let defaultValuesWithOverrides = MADLIB_LIST[initalIndex].defaultSelections;
  if (params[MADLIB_SELECTIONS_PARAM]) {
    params[MADLIB_SELECTIONS_PARAM].split(",").forEach((override) => {
      const [phraseSegmentIndex, value] = override.split(":");
      let phraseSegments: PhraseSegment[] = MADLIB_LIST[initalIndex].phrase;
      if (
        Object.keys(phraseSegments).includes(phraseSegmentIndex) &&
        Object.keys(phraseSegments[Number(phraseSegmentIndex)]).includes(value)
      ) {
        defaultValuesWithOverrides[Number(phraseSegmentIndex)] = value;
      }
    });
  }

  const [madLib, setMadLib] = useState<MadLib>({
    ...MADLIB_LIST[initalIndex],
    activeSelections: defaultValuesWithOverrides,
  });

  const [sticking, setSticking] = useState<boolean>(false);
  const [joyrideRun, setJoyrideRun] = useState<boolean>(true);

  const EXPLORE_DATA_ID = "main";

  useEffect(() => {
    if (joyrideRun) {
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
  }, [joyrideRun]);

  const steps = [
    Step(
      "#onboarding-start-your-search",
      "Start Your Search",
      <>
        Complete the sentence by selecting a location. You can scroll left or
        right for more ways to search.
        <br />
        <i>
          Try it out: Search for 'Investigate impacts of <u>COVID-19</u> in{" "}
          <u>California</u>'
        </i>
      </>
    ),
    Step(
      "#onboarding-limits-in-the-data",
      "Limits in the data",
      <>
        The Tracker ingests and standardizes many data sets, but unfortunately
        there is missing, incomplete, or misclassified data in our sources. 
        <br />
        <i>
          *We acknowledge that deep inequities exist in the very structure we
          use to collect and share data. We are committed to helping to fix
          this.
        </i>
      </>
    ),
    Step(
      "#onboarding-explore-trends",
      "Explore further to see trends",
      <>
        Where available, the tracker offers breakdowns by race and ethnicity,
        sex, and age. This is currently limited to the national and state level,
        with county-level data coming soon.
        <br />
        <i>
          Try it out: See information around <u>COVID Hospitalizations</u> by{" "}
          <u>Gender</u>'
        </i>
      </>
    ),
  ];
  const joyrideCallback = (data: any) => {
    // eslint-disable-next-line
    const { unusedAction, unusedIndex, status, unusedType } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setJoyrideRun(false);
    }
  };

  return (
    <div id={EXPLORE_DATA_ID} tabIndex={-1} className={styles.ExploreData}>
      <Joyride
        steps={steps}
        callback={joyrideCallback}
        disableScrolling={true}
        run={true}
        styles={{
          options: {
            arrowColor: "#0B5240",
            backgroundColor: "#0B5240",
            primaryColor: "#000",
            textColor: "#fff",
            width: 900,
            zIndex: 1000,
          },
        }}
      />
      <div
        className={styles.CarouselContainer}
        id="onboarding-start-your-search"
      >
        <Carousel
          className={styles.Carousel}
          timeout={200}
          autoPlay={false}
          indicators={!sticking}
          animation="slide"
          navButtonsAlwaysVisible={true}
          index={initalIndex}
          onChange={(index: number) => {
            setMadLib({
              ...MADLIB_LIST[index],
              activeSelections: MADLIB_LIST[index].defaultSelections,
            });
          }}
        >
          {MADLIB_LIST.map((madlib: MadLib, i) => (
            <CarouselMadLib madLib={madLib} setMadLib={setMadLib} key={i} />
          ))}
        </Carousel>
      </div>
      <div className={styles.ReportContainer}>
        <ReportProvider madLib={madLib} setMadLib={setMadLib} />
      </div>
    </div>
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
    // TODO -don't use this hack to figure out if its a FIPS or not
    return Object.keys(phraseSegment).length > 20
      ? Object.keys(phraseSegment)
          .sort((a: string, b: string) => {
            if (a[0].length === b[0].length) {
              return a[0].localeCompare(b[0]);
            }
            return b[0].length > a[0].length ? -1 : 1;
          })
          .map((fipsCode) => new Fips(fipsCode))
      : Object.entries(phraseSegment).sort((a, b) => a[0].localeCompare(b[0]));
  }

  return (
    <Grid
      container
      spacing={1}
      justify="center"
      className={styles.CarouselItem}
    >
      {props.madLib.phrase.map(
        (phraseSegment: PhraseSegment, index: number) => (
          <React.Fragment key={index}>
            {typeof phraseSegment === "string" ? (
              <Grid item>{phraseSegment}</Grid>
            ) : (
              <Grid item>
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
              </Grid>
            )}
          </React.Fragment>
        )
      )}
    </Grid>
  );
}

function Step(targetId: string, title: string, content: JSX.Element) {
  return {
    target: targetId,
    content: (
      <div style={{ textAlign: "left" }}>
        <h4>{title}</h4>
        {content}
      </div>
    ),
    disableBeacon: true,
  };
}

export default ExploreDataPage;
