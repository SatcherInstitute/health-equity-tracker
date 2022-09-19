import { useState, useRef, useEffect } from "react";
import { RefObject } from "react";

export function useResponsiveWidth(
  defaultWidth: number
): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(defaultWidth);
  // Initial spec state is set in useEffect when default geo is set
  const ref = useRef<HTMLDivElement>(document.createElement("div"));

  useEffect(() => {
    if (ref && ref.current) {
      setWidth(ref.current.offsetWidth);
    }

    const handleResize = () => {
      if (ref && ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref]);

  return [ref, width];
}
