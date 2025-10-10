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
        className={`font-extrabold font-sans-title text-black text-smallest uppercase tracking-widest ${className ?? 'mt-8 mb-2'}`}
      >
        {text}
      </p>
    </>
  )
}
