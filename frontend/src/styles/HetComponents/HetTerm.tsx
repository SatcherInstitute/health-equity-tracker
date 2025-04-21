import type { JSX } from "react";
interface HetTermProps {
  children?: JSX.Element | string | string[]
}
export default function HetTerm(props: HetTermProps) {
  return (
    <strong className='font-sansTitle font-semibold'>{props.children}</strong>
  )
}
