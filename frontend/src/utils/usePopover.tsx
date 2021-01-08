import React from "react";

export function usePopover(): [
  HTMLButtonElement | null,
  (event: React.MouseEvent<HTMLButtonElement>) => void,
  () => void,
  boolean
] {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return [anchorEl, handleClick, handleClose, open];
}
