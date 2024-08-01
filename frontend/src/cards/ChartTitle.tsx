interface ChartTitleProps {
  title: string
  subtitle?: string
  filterButton?: React.ReactNode
}

export default function ChartTitle(props: ChartTitleProps) {
  return (
    <div className='mx-3 mb-2 mt-0'>
      <h3 className='text-center m-0 p-0 text-title'>{props.title}</h3>
      {props.subtitle && (
        <h4 className='text-center m-0 p-0 text-small font-normal italic'>
          {props.subtitle}
        </h4>
      )}
      {props.filterButton}
    </div>
  )
}
