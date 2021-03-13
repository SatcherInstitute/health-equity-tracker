import { useRef, useState, useEffect } from "react";

export function useAutoFocusDialog(): [boolean, (open: boolean) => void] {
  const [isOpen, setIsOpen] = useState(false);

  const dialogElementRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (isOpen) {
      const { current: dialogElement } = dialogElementRef;
      if (dialogElement !== null) {
        dialogElement.focus();
      }
    }
  }, [isOpen]);

  return [isOpen, setIsOpen];
}
