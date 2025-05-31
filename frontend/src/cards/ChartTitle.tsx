interface ChartTitleProps {
  title: string
  subtitle?: string
  filterButton?: React.ReactNode
}

export default function ChartTitle(props: ChartTitleProps) {
  return (
    <div className='mx-3 mt-0 mb-2'>
      <h2 className='m-0 p-0 text-center font-medium text-alt-black text-title'>
        {props.title}
      </h2>
      {props.subtitle && (
        <h3 className='m-0 p-0 text-center font-normal text-small italic'>
          {props.subtitle}
        </h3>
      )}
      {props.filterButton}
    </div>
  )
}
