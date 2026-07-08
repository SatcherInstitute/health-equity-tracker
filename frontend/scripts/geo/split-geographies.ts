#!/usr/bin/env tsx
// Splits the full US topology (scripts/geo/geographies.json) into the files
// the app actually loads per view, emitted to src/assets/geo/ (gitignored,
// regenerated on install/predev/prebuild — same pipeline as design tokens):
//
//   geographies_states.json         national map: 56 states/territories
//   geographies_counties-XX.json    one per state/territory: its counties only
//
// The split is lossless: each output keeps only the arcs its geometries
// reference (indices remapped), so decoded features are identical to those
// decoded from the full topology. State outlines are reconstructed at runtime
// by merging county geometries, which share the same arcs.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(__dir, 'geographies.json')
const OUT_DIR = resolve(__dir, '../../src/assets/geo')

interface TopoGeometry {
  type: string
  id: string
  properties?: Record<string, unknown>
  arcs?: any[]
}

interface Topology {
  type: 'Topology'
  transform?: Record<string, unknown>
  objects: Record<string, { type: string; geometries: TopoGeometry[] }>
  arcs: any[]
}

// Rebuild a topology containing only the given geometries, keeping only the
// arcs they reference and remapping arc indices accordingly.
function pruneTopology(
  topo: Topology,
  objectName: string,
  geometries: TopoGeometry[],
): Topology {
  const used = new Set<number>()
  const collect = (arcs: any[]) => {
    for (const a of arcs) {
      // biome-ignore lint/suspicious/noBitwiseOperators: topojson encodes reversed arcs as one's complement
      Array.isArray(a) ? collect(a) : used.add(a < 0 ? ~a : a)
    }
  }
  for (const g of geometries) {
    if (g.arcs) collect(g.arcs)
  }

  const sorted = [...used].sort((x, y) => x - y)
  const remap = new Map(sorted.map((oldIndex, i) => [oldIndex, i]))
  const remapArcs = (arcs: any[]): any[] =>
    arcs.map((a) =>
      Array.isArray(a)
        ? remapArcs(a)
        : // biome-ignore lint/suspicious/noBitwiseOperators: preserve arc direction encoding
          a < 0
          ? ~remap.get(~a)!
          : remap.get(a)!,
    )

  return {
    type: 'Topology',
    ...(topo.transform && { transform: topo.transform }),
    objects: {
      [objectName]: {
        type: 'GeometryCollection',
        geometries: geometries.map((g) =>
          g.arcs ? { ...g, arcs: remapArcs(g.arcs) } : g,
        ),
      },
    },
    arcs: sorted.map((i) => topo.arcs[i]),
  }
}

const topo: Topology = JSON.parse(await readFile(SOURCE, 'utf8'))
await mkdir(OUT_DIR, { recursive: true })

const states = pruneTopology(topo, 'states', topo.objects.states.geometries)
await writeFile(
  resolve(OUT_DIR, 'geographies_states.json'),
  JSON.stringify(states),
)

const countiesByState = new Map<string, TopoGeometry[]>()
for (const g of topo.objects.counties.geometries) {
  const stateFips = String(g.id).slice(0, 2)
  const group = countiesByState.get(stateFips)
  group ? group.push(g) : countiesByState.set(stateFips, [g])
}

for (const [stateFips, geometries] of countiesByState) {
  const counties = pruneTopology(topo, 'counties', geometries)
  await writeFile(
    resolve(OUT_DIR, `geographies_counties-${stateFips}.json`),
    JSON.stringify(counties),
  )
}

console.log(
  `✔  geographies split → 1 states file + ${countiesByState.size} county files in src/assets/geo/`,
)
