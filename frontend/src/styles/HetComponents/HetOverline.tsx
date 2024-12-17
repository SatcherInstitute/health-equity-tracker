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
        className={`${className ?? 'mt-8 mb-2 block'} text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest`}
      >
        {text}
      </p>
    </>
  )
}
