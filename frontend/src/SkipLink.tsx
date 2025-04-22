/*
Accessible "Skip to Main Content" link
for screenreader and non-mouse users
 */
export default function SkipLink() {
  return (
    <a
      className='-top-96 -translate-x-1/2 absolute left-1/2 z-skipLink h-auto w-1/2 overflow-auto rounded border-4 border-timeYellow border-solid bg-timeYellow p-2 text-center text-black text-smallestHeader focus:top-5 active:top-5'
      href='#main'
    >
      Skip to main content
    </a>
  )
}
