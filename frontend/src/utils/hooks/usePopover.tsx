import React from "react";

export interface PopoverElements {
  // Element to which the popover will be anchored
  anchor: HTMLElement | null;
  // Function called when popover should be opened
  open: (event: React.MouseEvent<HTMLElement>) => void;
  // Function called when popover should be closed
  close: () => void;
  // Whether or not popover should be open
  isOpen: boolean;
}

export function usePopover(): PopoverElements {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  const open = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };

  const close = () => {
    setAnchor(null);
  };

  const isOpen = Boolean(anchor);

  return { anchor, open, close, isOpen };
}
