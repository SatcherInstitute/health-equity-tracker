/* 
Hook that 
*/

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const options = {
  // how much of the card needs to be showing to be "on screen"
  threshold: 0.5,
};

export default function useCardScrollTracking(
  activeHashId: string,
  steps: any[],
  cardsInView?: string[],
  setCardsInView?: any,
  setActiveStep?: any
) {
  const { ref, inView } = useInView(options);

  // when each card changes visibility, update the cards in view / active step
  useEffect(() => {
    if (cardsInView !== undefined && setCardsInView !== undefined) {
      let _cardsInView = [...cardsInView];

      // add/remove visible cards
      if (inView && !_cardsInView.includes(activeHashId))
        _cardsInView.push(activeHashId);
      else if (!inView && _cardsInView.includes(activeHashId))
        _cardsInView = _cardsInView.filter((id) => id !== activeHashId);
      setCardsInView(_cardsInView);

      // if more than one card is visible, set active to card the middle
      const middle = Math.floor(_cardsInView.length / 2);
      _cardsInView.length > 0 &&
        setActiveStep?.(
          steps.findIndex((step) => step.hashId === _cardsInView[middle])
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return ref;
}
