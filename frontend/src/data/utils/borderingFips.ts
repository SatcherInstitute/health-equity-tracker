import { neighbors } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

// Adjacency is derived at runtime from the topology the map already loads
// rather than shipped as a precomputed file: neighbors() takes about 1 ms on
// the largest file (Texas, 254 counties), so there is nothing to precompute.
//
// "Bordering" means sharing a boundary arc. Places that touch only at a point
// (the Four Corners) or across water (islands, Staten Island) don't count, and
// a place with no geometry (Falls Church, VA) has none. County topologies are
// per state, so counties across a state line are never included.
type BorderingMap = Map<string, string[]>

const cache = new WeakMap<GeometryCollection, BorderingMap>()

function buildBorderingMap(collection: GeometryCollection): BorderingMap {
  const { geometries } = collection
  const neighborIndexes = neighbors(geometries)
  const byFips: BorderingMap = new Map()
  geometries.forEach((geometry, i) => {
    if (geometry.id == null) return
    const bordering = neighborIndexes[i]
      .map((j) => geometries[j].id)
      .filter((id) => id != null)
      .map(String)
      .sort()
    byFips.set(String(geometry.id), bordering)
  })
  return byFips
}

// Sorted FIPS codes bordering `fipsCode`: states for a state code (pass the
// states topology), or counties in the same state for a county code (pass that
// state's county topology). [] when none border it or it isn't in the topology.
export function getBorderingFips(
  topology: Topology,
  fipsCode: string,
): string[] {
  const objectKey = fipsCode.length === 5 ? 'counties' : 'states'
  const collection = topology.objects[objectKey] as
    | GeometryCollection
    | undefined
  if (!collection) return []

  let byFips = cache.get(collection)
  if (!byFips) {
    byFips = buildBorderingMap(collection)
    cache.set(collection, byFips)
  }
  return byFips.get(fipsCode) ?? []
}
