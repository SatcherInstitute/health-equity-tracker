import React, { useState } from "react";
// import "feeder-react-feedback/dist/feeder-react-feedback.css"; // 3rd-party default styles
import "./FeedbackOverrides.css"; // overrides to above styles
// https://github.com/rishipr/feeder-react-feedback
// @ts-ignore
import Feedback from "feeder-react-feedback"; // import Feedback component

import { useBottomScrollListener } from "react-bottom-scroll-listener";

const FEEDBACK_ID = "6171cc2965b82c00045239dc"; // view collected feedback at feeder.sh/dashboard
const BOTTOM_SCROLL_OPTIONS = {
  offset: 500,
};

export default function FeedbackBox(props: { alwaysShow?: boolean }) {
  const [showFeedback, setShowFeedback] = useState(props.alwaysShow || false);

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
