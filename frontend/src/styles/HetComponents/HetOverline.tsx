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
        className={`${className ?? 'mt-8 mb-2 block'} text-left font-extrabold font-sans-title text-black text-smallest uppercase tracking-widest`}
      >
        {text}
      </p>
    </>
  )
}
