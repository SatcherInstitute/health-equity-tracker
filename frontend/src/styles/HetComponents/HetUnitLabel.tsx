interface HetUnitLabelProps {
  className?: string
  children?: React.ReactNode
}

export default function HetUnitLabel(props: HetUnitLabelProps) {
  return (
    <span
      className={`font-light font-sansText text-altDark text-smallest tracking-tighter ${
        props.className ?? ''
      } `}
    >
      {props.children}
    </span>
  )
}
