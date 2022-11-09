import { Grid } from "@material-ui/core";
import React from "react";
import { useLocation } from "react-router-dom";
import { Fips } from "../../data/utils/Fips";
import {
  getMadLibWithUpdatedValue,
  insertOptionalThe,
  MadLib,
  PhraseSegment,
} from "../../utils/MadLibs";
import OptionsSelector from "./OptionsSelector";
import styles from "./ExploreDataPage.module.scss";

export default function CarouselMadLib(props: {
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
                <span className={styles.NonClickableMadlibText}>
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
