import { readOrCreateLibraryMetadata } from "../src/bun/metadata/scanner"

const dir = Bun.argv[2]
if (!dir) throw new Error("Usage: bun run <script> <directory>")

const metadata = await readOrCreateLibraryMetadata(dir)
console.log("Successfully generated metadata for library:", metadata)
