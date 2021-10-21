import React, { useState } from "react";
// @ts-ignore
import Feedback from "feeder-react-feedback"; // import Feedback component
import "feeder-react-feedback/dist/feeder-react-feedback.css"; // import stylesheet
import { useBottomScrollListener } from "react-bottom-scroll-listener";

const FEEDBACK_ID = "6171bac0f80b9e0004efd9af"; // view collected feedback at feeder.sh/dashboard
const BOTTOM_SCROLL_OPTIONS = {
  offset: 500,
};

export default function FeedbackBox() {
  const [showFeedback, setShowFeedback] = useState(false);

  useBottomScrollListener(() => setShowFeedback(true), BOTTOM_SCROLL_OPTIONS);

  return showFeedback ? (
    <Feedback
      projectId={FEEDBACK_ID}
      email={false}
      feedbackTypes={["General", "Problem", "Idea"]}
      hoverBorderColor={"#0b5240"}
      postSubmitButtonMsg="Thank you for helping us advance health equity"
      primaryColor={"#0b5240"}
      textColor={"#FFFFFF"}
    />
  ) : (
    <></>
  );
}
