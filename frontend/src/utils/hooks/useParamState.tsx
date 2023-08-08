import { locationAtom } from '../sharedSettingsState'
import { useAtom } from 'jotai'

export function useParamState<ParamStateType>(
  paramKey: string
): [ParamStateType, (newValue: ParamStateType) => void] {
  const [location, setLocation] = useAtom(locationAtom)

  const paramState = location.searchParams?.get(paramKey) as ParamStateType

  // console.log(typeof (paramState) === ParamStateType);

  function setParamState(newValue: ParamStateType): void {
    newValue
      ? location.searchParams?.append(paramKey, newValue as string)
      : location.searchParams?.delete(paramKey)

    setLocation((prev) => ({
      ...prev,
      searchParams: location.searchParams,
    }))
  }

  return [paramState, setParamState]
}
