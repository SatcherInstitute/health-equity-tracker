import {
  ANY_FEATURE_FLAG_ON,
  describeFeatureFlags,
  logFeatureFlags,
} from '../../featureFlags'

export default function HetFeatureFlagIndicator() {
  if (!ANY_FEATURE_FLAG_ON) return null

  const onFlags = describeFeatureFlags().filter(({ on }) => on)
  const summary = onFlags
    .map(({ key, source }) => `${key} (${source})`)
    .join('\n')

  return (
    <button
      type='button'
      onClick={logFeatureFlags}
      title={`Active feature flags:\n${summary}\n\nClick to log every flag to the browser console.`}
      aria-label={`${onFlags.length} active feature flags: ${onFlags
        .map(({ key, source }) => `${key} via ${source}`)
        .join(', ')}. Activate to log every flag to the browser console.`}
      className='ml-2 cursor-pointer self-center border-0 bg-transparent p-1 text-title leading-none'
    >
      <span aria-hidden='true'>🧑🏽‍🔬</span>
    </button>
  )
}
