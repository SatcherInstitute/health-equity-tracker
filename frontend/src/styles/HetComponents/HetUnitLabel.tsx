interface HetUnitLabelProps {
  className?: string
  children?: React.ReactNode
}

export default function HetUnitLabel(props: HetUnitLabelProps) {
  return (
    <span
      className={`font-light font-sans-text text-alt-dark text-smallest tracking-tighter ${
        props.className ?? ''
      } `}
    >
      {props.children}
    </span>
  )
}
