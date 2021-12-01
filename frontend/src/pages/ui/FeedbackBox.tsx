import React, { useState } from "react";
// @ts-ignore
import Feedback from "@benhammondmusic/feeder-react-feedback";
import "@benhammondmusic/feeder-react-feedback/dist/feeder-react-feedback.css"; // import stylesheet

import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { useCookies } from "react-cookie";

const FEEDBACK_ID = process.env.REACT_APP_FEEDBACK_ID; // view collected feedback at feeder.sh/dashboard
const BOTTOM_SCROLL_OPTIONS = {
  offset: 500,
};

export default function FeedbackBox(props: { alwaysShow?: boolean }) {
  // If cookie is in place, this is a return user and therefor eligible for feedback
  const [cookies] = useCookies();
  const isReturnUser = cookies.skipOnboarding;
  const [showFeedback, setShowFeedback] = useState(props.alwaysShow || false);

  useBottomScrollListener(() => setShowFeedback(true), BOTTOM_SCROLL_OPTIONS);

  return showFeedback && isReturnUser ? (
    <Feedback
      projectId={FEEDBACK_ID}
      email={false}
      feedbackPrompt={"What brings you to the Health Equity Tracker?"}
      feedbackTypes={[
        "General Health Equity / Other (please specify below)",
        "COVID-19 / Vaccination Data",
        "Chronic Disease Data",
        "Social / Political Determinants Data",
        "Behavioral/Mental Health Data",
      ]}
      interestPrompt={"What field are you in?"}
      interestTypes={[
        "Non-Profit / Community Engagement",
        "Legal / Political / Governmental",
        "Medical / Clinical",
        "Academic",
        "Other (please specify below)",
      ]}
      textboxPrompt={"Did you get what you needed today?"}
      hoverBorderColor={"#0b5240"}
      postSubmitButtonMsg="Thank you for helping us advance health equity"
      primaryColor={"#0b5240"}
      textColor={"#FFFFFF"}
    />
  ) : (
    <></>
  );
}
