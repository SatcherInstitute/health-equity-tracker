import { currentYear } from '../../cards/ui/SourcesHelpers'

export default function HetCopyright() {
  return (
    <small className='text-alt-dark text-smallest'>&copy;{currentYear()}</small>
  )
}
