import React, { useState } from "react";
import "../../index.css";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const topics = ["COVID-19", "Asthma", "HIV", "Poverty", "Suicide", "Diabetes"];

const MadLibAnimation: React.FC = () => {
  const [animationEnabled, setAnimationEnabled] = useState(true);

  const toggleAnimation = () => {
    setAnimationEnabled(!animationEnabled);
  };

  return (
    <div className="overflow-hidden flex items-center m-0 p-0 justify-center flex-row">
      <p className="duration-200 ease-in-out leading-lhModalHeading lg:text-smallerHeader opacity-100 overflow-hidden m-0 pb-4 rotate-0 scale-100 skew-0 sm:text-smallestHeader text-center text-sansTitle transform transition-all transition-transform translate-z-0 w-full xs:text-smallest xs:pb-2 xs:mb-4">
        Investigate rates of{" "}
        <span
          className="inline-flex top-[0.8rem] left-0 relative w-56 h-10 bg-white rounded-md
        pt-1 mx-4 my-1 min-w-[100px] border border-solid border-altGreen  py-0 pl-3 pr-1 text-title font-medium text-altGreen shadow-raised-tighter sm:text-smallestHeader lg:text-smallerHeader xs:text-smallest xs:h-8 xs:mt-0 xs:mb-4 xs:w-32 xs:top-[1.2rem] xs:w-auto items-center justify-center
        
        "
        >
          {animationEnabled ? (
            topics.map((topic, index) => (
              <span
                key={index}
                className={`absolute bg-white mx-auto p-0 topic w-48 text-center flex items-center justify-around xs:text-smallest xs:w-24`}
              >
                {topic}
                <ArrowDropDownIcon />
              </span>
            ))
          ) : (
            <span
              className="absolute pr-4 w-full text-center flex items-center justify-around xs:text-smallest
            "
            >
              select a topic <ArrowDropDownIcon />{" "}
            </span>
          )}
        </span>{" "}
        <span className="xs:hidden xl:inline-flex lg:inline-flex md:inline-flex sm:inline-flex">
          in the United States
        </span>
      </p>
      <button
        onClick={toggleAnimation}
        className="category-span text-[10px] uppercase text-[#282c25] font-sansTitle font-bold bg-ashgray30 rounded-sm py-1 px-2 mr-2 mt-1 border-none"
      >
        {animationEnabled ? "Disable Animation" : "Enable Animation"}
      </button>
    </div>
  );
};

export default MadLibAnimation;
