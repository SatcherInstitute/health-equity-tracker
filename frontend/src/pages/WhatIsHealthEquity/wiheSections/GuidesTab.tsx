import HetCarousel from '../../../styles/HetComponents/HetCarousel'
import { HetCarouselCard } from '../../../styles/HetComponents/HetCarouselCard'
import { guideMappings } from '../wiheContent/GuidesTabData'

export default function GuidesTab() {
  return <HetCarousel items={guideMappings} CardComponent={HetCarouselCard} />
}
