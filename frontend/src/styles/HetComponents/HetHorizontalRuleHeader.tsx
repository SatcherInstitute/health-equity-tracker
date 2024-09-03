interface HetHorizontalRuleHeadingProps {
  headingText: string
  id?: string
}
export default function HetHorizontalRuleHeading(
  props: HetHorizontalRuleHeadingProps,
) {
  return (
    <div id={props.id} className='mt-5 flex w-full items-center pb-4 pt-20'>
      <div className='flex-1 border-0 border-t border-solid border-altGrey'></div>

      <h3 className='m-0 pe-4 ps-4 text-center font-sansText text-smallestHeader font-light text-altBlack'>
        {props.headingText}
      </h3>
      <div className='flex-1 border-0 border-t border-solid border-altGrey'></div>
    </div>
  )
}
