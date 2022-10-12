import { useEffect } from "react";

/* 
Hook that runs the supplied handler callback function whenever the "Escape" key is pressed. This is important for accessibility for non-standard widgets (like the Trend Tooltip) where the user would expect an Escape press to close any opened tooltips or pop-ups and would be able to view the underlying graphic without items blocking the view.

Params: 
    handleEscapeKey: Function that will be run on key press

*/

const useEscape = (handleEscapeKey: Function) => {
  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.keyCode === 27) handleEscapeKey();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [handleEscapeKey]);
};

export default useEscape;
