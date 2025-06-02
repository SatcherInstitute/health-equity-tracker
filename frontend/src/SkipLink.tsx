/*
Accessible "Skip to Main Content" link
for screenreader and non-mouse users
 */
export default function SkipLink() {
  return (
    <a
      className='-top-96 -translate-x-1/2 absolute left-1/2 z-skip-link h-auto w-1/2 overflow-auto rounded border-4 border-time-yellow border-solid bg-time-yellow p-2 text-center text-black text-smallest-header focus:top-5 active:top-5'
      href='#main'
    >
      Skip to main content
    </a>
  )
}
