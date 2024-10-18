import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import HetCarousel from '../../../styles/HetComponents/HetCarousel'
import { HetCarouselCard } from '../../../styles/HetComponents/HetCarouselCard'
import { externalResourceMappings } from '../wiheContent/ExternalResourcesTabData'
import { urlMap } from '../../../utils/externalUrls'

export default function VideosTab() {
  return (
    <>
      <HetCarousel
        items={externalResourceMappings}
        CardComponent={HetCarouselCard}
      />
      <HetTextArrowLink
        link={urlMap.hetYouTubeShorts}
        linkText='Visit our YouTube page'
        containerClassName='flex items-center justify-center mt-8 mx-auto'
        linkClassName='font-sansTitle text-smallestHeader'
      />
    </>
  )
}
