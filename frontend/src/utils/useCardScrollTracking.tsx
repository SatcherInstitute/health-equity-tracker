/* 
Hook that 
*/

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const options = {
  threshold: 0.66,
};

export default function useCardScrollTracking(
  activeHashId: string,
  steps: any[],
  cardsInView?: string[],
  setCardsInView?: any,
  setActiveStep?: any
) {
  const { ref, inView } = useInView(options);

  useEffect(() => {
    if (cardsInView !== undefined && setCardsInView !== undefined) {
      let _cardsInView = [...cardsInView];

      if (inView && !_cardsInView.includes(activeHashId))
        _cardsInView.push(activeHashId);
      else if (!inView && _cardsInView.includes(activeHashId))
        _cardsInView = _cardsInView.filter((id) => id !== activeHashId);
      setCardsInView(_cardsInView);
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
