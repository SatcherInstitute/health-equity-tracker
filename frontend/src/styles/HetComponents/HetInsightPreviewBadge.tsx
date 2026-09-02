import { disarmInsightPreview, INSIGHT_PREVIEW_MODE } from '../../featureFlags'

export default function HetInsightPreviewBadge() {
  if (!INSIGHT_PREVIEW_MODE) return null

  return (
    <div
      role='status'
      className='flex flex-wrap items-center justify-center gap-x-2 bg-standard-warning px-4 py-0.5 text-alt-black text-small'
    >
      <span>
        <span aria-hidden='true'>✨</span> AI insight preview is on for this
        browser tab only, and is not visible to the public.
      </span>
      <button
        type='button'
        onClick={disarmInsightPreview}
        className='cursor-pointer border-0 bg-transparent p-0 text-alt-black text-small underline'
      >
        Turn off
      </button>
    </div>
  )
}
