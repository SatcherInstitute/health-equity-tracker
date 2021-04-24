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

  useEffect(() => {
    const header = document.getElementById("ExploreData");
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
  }, []);

  return (
    <div id="main" tabIndex={-1} className={styles.ExploreData}>
      <div className={styles.CarouselContainer}>
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

export default ExploreDataPage;
