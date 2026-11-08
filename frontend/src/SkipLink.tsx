/*
Accessible "Skip to Main Content" link
for screenreader and non-mouse users
 */
export default function SkipLink() {
  return (
    <a
      className='z-skip-link border-time-yellow bg-time-yellow text-alt-black text-smallest-header absolute -top-96 left-1/2 h-auto w-1/2 -translate-x-1/2 overflow-auto rounded border-4 border-solid p-2 text-center focus:top-5 active:top-5'
      href='#main'
    >
      Skip to main content
    </a>
  )
}
