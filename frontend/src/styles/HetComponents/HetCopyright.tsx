import { currentYear } from '../../cards/ui/SourcesHelpers'

export default function HetCopyright() {
  return (
    <small className='text-altDark text-smallest'>&copy;{currentYear()}</small>
  )
}
