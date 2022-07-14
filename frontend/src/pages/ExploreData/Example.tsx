import React from "react";
import { FixedSizeList } from "react-window";
import { Fips, FIPS_MAP } from "../../data/utils/Fips";
import { PhraseSegment } from "../../utils/MadLibs";

function getOptionsFromPhraseSegement(phraseSegment: PhraseSegment): Fips[] {
  return Object.keys(phraseSegment)
    .sort((a: string, b: string) => {
      if (a.length === b.length) {
        return a.localeCompare(b);
      }
      return b.length > a.length ? -1 : 1;
    })
    .map((fipsCode) => new Fips(fipsCode));
}

const items = getOptionsFromPhraseSegement(FIPS_MAP);

const Row = ({ index, style }: { index: number; style: any }) => {
  const placeFips = items[index];

  return placeFips ? (
    <div style={style}>{placeFips.getDisplayName()}</div>
  ) : (
    <></>
  );
};

export const Example = () => (
  <FixedSizeList
    height={150}
    itemCount={items.length}
    itemSize={35}
    width={300}
  >
    {Row}
  </FixedSizeList>
);
