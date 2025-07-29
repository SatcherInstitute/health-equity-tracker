import HetCarousel from '../../../styles/HetComponents/HetCarousel'
import { HetCarouselCard } from '../../../styles/HetComponents/HetCarouselCard'
import { externalResourceMappings } from '../wiheContent/ExternalResourcesTabData'

export default function VideosTab() {
  return (
    <HetCarousel
      items={externalResourceMappings}
      CardComponent={HetCarouselCard}
    />
  )
}
