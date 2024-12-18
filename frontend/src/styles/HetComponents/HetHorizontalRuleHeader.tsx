interface HetHorizontalRuleHeadingProps {
  headingText: string
  id?: string
}
export default function HetHorizontalRuleHeading(
  props: HetHorizontalRuleHeadingProps,
) {
  return (
    <div id={props.id} className='mt-5 flex w-full items-center pt-20 pb-4'>
      <div className='flex-1 border-0 border-altGrey border-t border-solid'></div>

      <h3 className='m-0 ps-4 pe-4 text-center font-light font-sansText text-altBlack text-smallestHeader'>
        {props.headingText}
      </h3>
      <div className='flex-1 border-0 border-altGrey border-t border-solid'></div>
    </div>
  )
}
