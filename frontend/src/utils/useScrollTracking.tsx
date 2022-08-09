/* 
Hook that 
*/

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  ScrollableHashId,
  StepData,
} from "../pages/ExploreData/TableOfContentsStepper";

const options = {
  // how much of the card needs to be showing to be "on screen"
  threshold: 0.7,
};

export default function useCardScrollTracking(
  activeHashId: ScrollableHashId,
  steps: StepData[],
  setActiveStep?: React.Dispatch<React.SetStateAction<number>>
) {
  const { ref, inView } = useInView(options);

  // when each card appears, set as active step
  useEffect(() => {
    const stepIndexInView = steps.findIndex(
      (step) => step.hashId === activeHashId
    );
    if (setActiveStep && inView && stepIndexInView >= 0)
      setActiveStep(stepIndexInView);
  }, [activeHashId, inView, setActiveStep, steps]);

  return ref;
}
