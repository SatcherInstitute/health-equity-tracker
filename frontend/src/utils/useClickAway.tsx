/* 
Hook that allows a target component to rerender when user clicks outside of it
Based off https://usehooks.com/useOnClickOutside/

To use: 
1. place a ref on the component you want to target, and send that ref in as an argument to this hook
2. place the key that this hook returns on that same targeted component

> NOTE: if using a custom jsx component like <MyComponent />, wrap it in a div like this: <div ref=ref><MyComponent key=childKey /></div>

*/

import { useEffect, useState } from "react";

export default function useClickAway(ref: any) {
  const [childKey, setChildKey] = useState(0);

  useEffect(() => {
    const listener = (event: any) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // else when key increments, React rerenders child component
      setChildKey(childKey + 1);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, childKey, setChildKey]);

  return [`clickAwayChild-${childKey}`, setChildKey];
}
