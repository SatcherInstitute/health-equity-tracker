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

export default function useCardScrollTracking(
  activeHashId: ScrollableHashId,
  steps: StepData[],
  setActiveStep?: React.Dispatch<React.SetStateAction<number>>
) {
  function handleInViewChange() {
    const stepIndexInView = steps.findIndex(
      (step) => step.hashId === activeHashId
    );
    if (setActiveStep && inView && stepIndexInView >= 0) {
      console.log("*");
      setActiveStep(stepIndexInView);
    }
  }

  const options = {
    // how much of the card needs to be showing to be "on screen"
    threshold: 0.5,
    // delay: 50,
    onChange: () => handleInViewChange(),
  };

  const { ref, inView } = useInView(options);

  return ref;
}
