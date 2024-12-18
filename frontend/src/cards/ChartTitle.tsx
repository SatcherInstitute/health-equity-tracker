interface ChartTitleProps {
  title: string
  subtitle?: string
  filterButton?: React.ReactNode
}

export default function ChartTitle(props: ChartTitleProps) {
  return (
    <div className='mx-3 mt-0 mb-2'>
      <h3 className='m-0 p-0 text-center text-title'>{props.title}</h3>
      {props.subtitle && (
        <h4 className='m-0 p-0 text-center font-normal text-small italic'>
          {props.subtitle}
        </h4>
      )}
      {props.filterButton}
    </div>
  )
}
