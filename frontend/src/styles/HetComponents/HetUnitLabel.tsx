interface HetUnitLabelProps {
  className?: string
  children?: React.ReactNode
}

export default function HetUnitLabel(props: HetUnitLabelProps) {
  return (
    <span
      className={`font-sansText text-smallest font-light tracking-tighter text-altDark ${
        props.className ?? ''
      } `}
    >
      {props.children}
    </span>
  )
}
