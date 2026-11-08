interface HetOverlineProps {
  text: string
  className?: string
}

export const HetOverline: React.FC<HetOverlineProps> = ({
  text,
  className,
}) => {
  return (
    <>
      <p
        className={`font-sans-title text-alt-black text-smallest font-extrabold tracking-widest uppercase ${className ?? 'mt-8 mb-2'}`}
      >
        {text}
      </p>
    </>
  )
}
