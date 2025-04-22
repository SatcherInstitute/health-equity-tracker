import { useAtom, useAtomValue } from 'jotai'
import { locationAtom } from '../sharedSettingsState'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
} from '../urlutils'

const paramsNotHandledByJotai = [
  MADLIB_SELECTIONS_PARAM,
  MADLIB_PHRASE_PARAM,
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
]

export function useParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType,
): [ParamStateType, (newValue: ParamStateType) => void] {
  const [locationState, setLocationState] = useAtom(locationAtom)

  const paramState =
    locationState.searchParams?.get(paramKey) ?? paramDefaultValue ?? ''

  function setParamState(newValue: ParamStateType): void {
    const existingURLParams = new URLSearchParams(window.location.search)
    const existingJotaiParams = new URLSearchParams(locationState.searchParams)

    for (const param of paramsNotHandledByJotai) {
      existingJotaiParams.delete(param)
    }

    const combinedParams = new URLSearchParams({
      ...Object.fromEntries(existingURLParams),
      ...Object.fromEntries(existingJotaiParams),
    })

    newValue
      ? combinedParams.set(paramKey, newValue as string)
      : combinedParams.delete(paramKey)

    const paramsHaveChanged =
      existingURLParams.toString() !== combinedParams.toString()

    paramsHaveChanged &&
      setLocationState((prev) => ({
        ...prev,
        searchParams: combinedParams,
      }))
  }

  return [paramState as ParamStateType, setParamState]
}

function useGetParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType,
): ParamStateType {
  const locationState = useAtomValue(locationAtom)
  const paramState =
    locationState.searchParams?.get(paramKey) ?? paramDefaultValue ?? ''
  return paramState as ParamStateType
}
