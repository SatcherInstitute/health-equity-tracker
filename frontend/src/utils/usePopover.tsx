import React from "react";

export function usePopover(): [
  HTMLElement | null,
  (event: React.MouseEvent<HTMLElement>) => void,
  () => void,
  boolean
] {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return [anchorEl, handleClick, handleClose, open];
}
