import { neighbors } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

// Topology questions that depend on which geometries share an arc: an arc
// used by one geometry is a coastline (or other outer edge), and two
// geometries sharing an arc border each other.
// cSpell:ignore topoObj

// Pre-compute which arc indices appear in exactly one geometry (coastlines).
// Shared arcs (borders between two geographies) appear twice and are excluded
// so ghost strokes never bleed across state/county lines.
export function buildCoastalArcSet(topoObj: GeometryCollection): Set<number> {
  const count = new Map<number, number>()
  for (const geom of topoObj.geometries) {
    const arcs = (geom as { arcs?: number[][] | number[][][] }).arcs
    if (!arcs) continue
    const rings: number[][] =
      geom.type === 'MultiPolygon'
        ? (arcs as number[][][]).flat(1)
        : (arcs as number[][])
    for (const ring of rings) {
      for (const rawIdx of ring) {
        const canon = rawIdx < 0 ? ~rawIdx : rawIdx
        count.set(canon, (count.get(canon) ?? 0) + 1)
      }
    }
  }
  const coastal = new Set<number>()
  for (const [idx, c] of count) {
    if (c === 1) coastal.add(idx)
  }
  return coastal
}

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
