import React, { useState } from "react";
// @ts-ignore
import Feedback from "@benhammondmusic/feeder-react-feedback";
import "@benhammondmusic/feeder-react-feedback/dist/feeder-react-feedback.css"; // import stylesheet

import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { useCookies } from "react-cookie";

const FEEDBACK_ID = "6171cc2965b82c00045239dc"; // view collected feedback at feeder.sh/dashboard
const BOTTOM_SCROLL_OPTIONS = {
  offset: 500,
};

export default function FeedbackBox(props: { alwaysShow?: boolean }) {
  // If cookie is in place, this is a return user and therefor eligible for feedback
  const [cookies, setCookie] = useCookies();
  const isReturnUser = cookies.skipOnboarding;
  const [showFeedback, setShowFeedback] = useState(props.alwaysShow || false);

  useBottomScrollListener(() => setShowFeedback(true), BOTTOM_SCROLL_OPTIONS);

  return showFeedback && isReturnUser ? (
    <Feedback
      projectId={FEEDBACK_ID}
      email={false}
      feedbackTypes={[
        "General/Professional Interest",
        "COVID-19/Vaccination Data",
        "Social/Political Determinants",
        "Behavioral/Mental Health",
        "Academic Interest",
        "Advocacy",
        "Legal/Policy Support",
      ]}
      interestTypes={[
        "Community Engagement",
        "Non-Profit",
        "Legal/Political",
        "Medical/Clinical",
        "Academic/Student",
        "Academic/Teaching",
        "Other (please specify below)",
      ]}
      hoverBorderColor={"#0b5240"}
      postSubmitButtonMsg="Thank you for helping us advance health equity"
      primaryColor={"#0b5240"}
      textColor={"#FFFFFF"}
    />
  ) : (
    <></>
  );
}
