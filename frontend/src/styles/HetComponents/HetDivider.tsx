interface HetDividerProps {
  className?: string
}

export default function HetDivider({ className }: HetDividerProps) {
  return (
    <hr
      className={`m-0 flex-shrink-0 border-0 border-b border-solid border-dividerGrey ${
        className ?? ''
      }`}
    />
  )
}
