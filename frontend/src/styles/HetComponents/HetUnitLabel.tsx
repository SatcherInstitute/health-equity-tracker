interface HetUnitLabelProps {
  className?: string
  children?: React.ReactNode
}

export default function HetUnitLabel(props: HetUnitLabelProps) {
  return (
    <span
      className={`font-sans-text text-alt-dark text-smallest font-light tracking-tighter ${
        props.className ?? ''
      } `}
    >
      {props.children}
    </span>
  )
}
