#!/usr/bin/env node
// Token build runner using @terrazzo/parser directly.
// Uses parse() + build() from the parser rather than the @terrazzo/cli (which
// brings in Vite/vite-node for TS config loading — unneeded for .mjs configs).
import { parse, build } from '@terrazzo/parser'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))

const { default: config } = await import('./terrazzo.config.mjs')

// Build an absolute URL for outDir so the parser can resolve output filenames
const outDirUrl = pathToFileURL(resolve(__dir, config.outDir) + '/')

// Load each token JSON file in the format parse() expects: { src, filename }
const sources = await Promise.all(
  config.tokens.map(async (tokenPath) => ({
    src: JSON.parse(await readFile(resolve(__dir, tokenPath), 'utf8')),
    filename: pathToFileURL(resolve(__dir, tokenPath)),
  }))
)

// Parse — validates tokens, resolves aliases, runs lint rules
const { tokens, resolver } = await parse(sources, {
  config: { ...config, outDir: outDirUrl },
})

// Build — runs each plugin's build() hook, collects outputFile() calls
const { outputFiles } = await build(tokens, {
  resolver,
  sources,
  config: { ...config, outDir: outDirUrl },
})

// Write collected output files to disk
await mkdir(fileURLToPath(outDirUrl), { recursive: true })
for (const { filename, contents } of outputFiles) {
  await writeFile(fileURLToPath(new URL(filename, outDirUrl)), contents, 'utf8')
}

console.log(`✔  ${Object.keys(tokens).length} tokens built → ${outputFiles.length} files`)
