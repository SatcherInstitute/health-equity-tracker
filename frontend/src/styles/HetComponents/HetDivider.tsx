interface HetDividerProps {
  className?: string
}

export default function HetDivider({ className }: HetDividerProps) {
  return (
    <hr
      className={`m-0 shrink-0 border-0 border-divider-grey border-b border-solid ${
        className ?? ''
      }`}
    />
  )
}
