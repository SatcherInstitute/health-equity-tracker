const HetDivider = ({ className }: { className?: string }) => {
  return (
    <hr
      className={`m-0 flex-shrink-0 border-0 border-b border-solid border-dividerGrey ${
        className ?? ''
      }`}
    />
  )
}

export default HetDivider
