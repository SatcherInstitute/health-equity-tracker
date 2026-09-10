import type { DemographicGroup } from '../../data/utils/Constants'
import {
  getDemographicGroupsFromGroupsParam,
  getGroupsParamFromDemographicGroups,
} from '../urlutils'
import { useParamState } from './useParamState'

// Trend cards share the same URL-list contract but each keeps its own param
// key (rate/share × compare column 1/2). This hook wraps useParamState so a
// caller passes DemographicGroup[] in and out; encoding, decoding, and the
// mount-time guard against spurious history entries live in one place.
export function useGroupsParam(
  paramKey: string,
): [DemographicGroup[], (groups: DemographicGroup[]) => void] {
  const [encoded, setEncoded] = useParamState<string>(paramKey, '')
  const groups = getDemographicGroupsFromGroupsParam(encoded)
  const setGroups = (next: DemographicGroup[]): void => {
    setEncoded(getGroupsParamFromDemographicGroups(next))
  }
  return [groups, setGroups]
}
