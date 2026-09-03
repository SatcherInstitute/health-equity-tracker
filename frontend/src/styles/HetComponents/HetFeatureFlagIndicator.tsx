import { ANY_FEATURE_FLAG_ON, logFeatureFlags } from '../../featureFlags'

export default function HetFeatureFlagIndicator() {
  if (!ANY_FEATURE_FLAG_ON) return null

  return (
    <button
      type='button'
      onClick={logFeatureFlags}
      title='Feature flags are active. Click to list them in the browser console.'
      aria-label='list active feature flags in the browser console'
      className='ml-2 cursor-pointer self-center border-0 bg-transparent p-1 text-title leading-none'
    >
      <span aria-hidden='true'>🧑🏽‍🔬</span>
    </button>
  )
}
