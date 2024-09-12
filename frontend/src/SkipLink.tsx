/*
Accessible "Skip to Main Content" link
for screenreader and non-mouse users
 */
export default function SkipLink() {
  return (
    <a
      className='rounded absolute -top-96 left-1/2 z-skipLink h-auto w-1/2 -translate-x-1/2 overflow-auto border-4 border-solid border-timeYellow bg-timeYellow p-2 text-center text-smallestHeader text-black focus:top-5 active:top-5'
      href='#main'
    >
      Skip to main content
    </a>
  )
}
