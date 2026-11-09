interface HetDividerProps {
  className?: string
}

export default function HetDivider({ className }: HetDividerProps) {
  return (
    <hr
      className={`border-divider-gray m-0 shrink-0 border-0 border-b border-solid ${
        className ?? ''
      }`}
    />
  )
}
