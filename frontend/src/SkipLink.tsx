/*
Accessible "Skip to Main Content" link
for screenreader and non-mouse users
 */
export default function SkipLink() {
  return (
    <a
      className='rounded absolute -top-96 left-1/2 z-z-top h-auto w-1/2 -translate-x-1/2 transform overflow-auto border-4 border-solid border-yellow bg-yellow p-2 text-center text-smallestHeader text-white focus:top-5 active:top-5'
      href='#main'
    >
      Skip to main content
    </a>
  )
}
