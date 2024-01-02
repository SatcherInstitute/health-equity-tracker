import { currentYear } from '../../cards/ui/SourcesHelpers'

export default function HetCopyright() {
  return (
    <small className='text-smallest text-altDark'>&copy;{currentYear()}</small>
  )
}
