interface HetTermProps {
  children?: React.ReactNode
}
export default function HetTerm(props: HetTermProps) {
  return (
    <strong className='font-sans-title font-semibold'>{props.children}</strong>
  )
}
