interface HetTermProps {
  children?: JSX.Element | string | string[]
}
export default function HetTerm(props: HetTermProps) {
  return <mark className='font-sansTitle font-semibold'>{props.children}</mark>
}
