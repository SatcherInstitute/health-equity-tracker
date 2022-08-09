/* 
Hook that goes inside each card you want to track scrolling for

Parameters:
  activeHashId: the id of the card
  steps: dictionary for the Table of Contents; mapping text labels to their hashIds
  setActiveStep: state setter from parent component tracking the "active" card in view

Returns:
  ref: to be placed on a parent element of the tracked element
*/

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ScrollableHashId, StepData } from "../pages/ui/TableOfContentsStepper";

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
    if (setActiveStep && inView && stepIndexInView >= 0) {
      console.log("*");
      setActiveStep(stepIndexInView);
    }
  }, [activeHashId, inView, setActiveStep, steps]);

  return ref;
}
