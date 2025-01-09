import HetCarousel from '../../../styles/HetComponents/HetCarousel'
import { HetCarouselCard } from '../../../styles/HetComponents/HetCarouselCard'
import { guideMappings } from '../wiheContent/GuidesTabData'

console.log('should fail')

export default function GuidesTab() {
  return (
    <>
      <HetCarousel items={guideMappings} CardComponent={HetCarouselCard} />
    </>
  )
}
