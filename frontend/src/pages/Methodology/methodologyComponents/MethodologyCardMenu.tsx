import { Link } from 'react-router-dom'
import {
  SOURCES_LINK,
  TOPIC_CATEGORIES_LINK,
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  COVID_19_LINK,
  HIV_LINK,
  PDOH_LINK,
  SDOH_LINK,
  DATA_METHOD_DEFINITIONS_LINK,
  METRICS_LINK,
  TOPIC_DEFINITIONS_LINK,
  RACES_AND_ETHNICITIES_LINK,
  RECOMMENDED_CITATION_LINK,
  NEW_AGE_ADJUSTMENT_LINK,
  NEW_METHODOLOGY_PAGE_LINK,
  GLOSSARY_LINK,
  MEDICATION_UTILIZATION_LINK,
} from '../../../utils/internalRoutes'
import HetListItemButton from '../../../styles/HetComponents/HetListItemButton'
import HetDivider from '../../../styles/HetComponents/HetDivider'

interface MethodologyCardMenuProps {
  className?: string
}

export default function MethodologyCardMenu(props: MethodologyCardMenuProps) {
  return (
    <nav
      aria-label='methodology sections'
      className={`flex flex-col rounded-sm py-0 tracking-normal shadow-raised-tighter ${
        props.className ?? ''
      } `}
    >
      <Link to={NEW_METHODOLOGY_PAGE_LINK} className='no-underline'>
        <HetListItemButton
          className='mx-2 pl-2 font-roboto'
          selected={window.location.pathname === NEW_METHODOLOGY_PAGE_LINK}
        >
          Introduction
        </HetListItemButton>
      </Link>

      <HetDivider />

      <Link className='no-underline' to={NEW_AGE_ADJUSTMENT_LINK}>
        <HetListItemButton
          className='mx-2 pl-2 font-roboto'
          selected={window.location.pathname === NEW_AGE_ADJUSTMENT_LINK}
        >
          Age-Adjustment
        </HetListItemButton>
      </Link>

      <HetDivider />

      <Link className='no-underline' to={SOURCES_LINK}>
        <HetListItemButton
          className='mx-2 pl-2 font-roboto'
          selected={window.location.pathname === SOURCES_LINK}
        >
          Data Sources
        </HetListItemButton>
      </Link>

      <HetDivider />

      <Link className='no-underline' to={TOPIC_CATEGORIES_LINK}>
        <HetListItemButton
          className='mx-2 pl-2 font-roboto'
          selected={window.location.pathname === TOPIC_CATEGORIES_LINK}
        >
          Topic Categories & Limitations
        </HetListItemButton>
      </Link>
      <ul className='my-0 list-none pl-0 leading-lhLoose'>
        <li>
          <Link className='no-underline' to={BEHAVIORAL_HEALTH_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === BEHAVIORAL_HEALTH_LINK}
              option='normalBlack'
            >
              Behavioral Health
            </HetListItemButton>
          </Link>
        </li>
        <li>
          <Link className='no-underline' to={CHRONIC_DISEASE_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === CHRONIC_DISEASE_LINK}
              option='normalBlack'
            >
              Chronic Diseases
            </HetListItemButton>
          </Link>
        </li>
        <li>
          <Link className='no-underline' to={COVID_19_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === COVID_19_LINK}
              option='normalBlack'
            >
              COVID-19
            </HetListItemButton>
          </Link>
        </li>
        <li>
          <Link className='no-underline' to={HIV_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === HIV_LINK}
              option='normalBlack'
            >
              HIV
            </HetListItemButton>
          </Link>
        </li>
        <li>
          <Link className='no-underline' to={PDOH_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === PDOH_LINK}
              option='normalBlack'
            >
              Political Determinants of Health
            </HetListItemButton>
          </Link>
        </li>
        <li>
          <Link className='no-underline' to={SDOH_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === SDOH_LINK}
              option='normalBlack'
            >
              Social Determinants of Health
            </HetListItemButton>
          </Link>
        </li>
        <li>
          <Link className='no-underline' to={MEDICATION_UTILIZATION_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={
                window.location.pathname === MEDICATION_UTILIZATION_LINK
              }
              option='normalBlack'
            >
              Medication Utilization
            </HetListItemButton>
          </Link>
        </li>
      </ul>
      <HetDivider />
      <Link className='no-underline' to={DATA_METHOD_DEFINITIONS_LINK}>
        <HetListItemButton
          className='mx-2 pl-2 font-roboto'
          selected={window.location.pathname === DATA_METHOD_DEFINITIONS_LINK}
        >
          Data Method Definitions
        </HetListItemButton>
      </Link>
      <ul className='my-0 list-none pl-0 leading-lhLoose'>
        <li>
          <Link className='no-underline' to={METRICS_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === METRICS_LINK}
              option='normalBlack'
            >
              Metrics
            </HetListItemButton>
          </Link>
        </li>
        <li>
          <Link className='no-underline' to={TOPIC_DEFINITIONS_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === TOPIC_DEFINITIONS_LINK}
              option='normalBlack'
            >
              Topic Definitions
            </HetListItemButton>
          </Link>
        </li>

        <li>
          <Link className='no-underline' to={RACES_AND_ETHNICITIES_LINK}>
            <HetListItemButton
              className='mx-2 pl-2 font-roboto'
              selected={window.location.pathname === RACES_AND_ETHNICITIES_LINK}
              option='normalBlack'
            >
              Races and Ethnicities
            </HetListItemButton>
          </Link>
        </li>
      </ul>
      <HetDivider />
      <Link className='no-underline' to={RECOMMENDED_CITATION_LINK}>
        <HetListItemButton
          className='mx-2 pl-2 font-roboto'
          selected={window.location.pathname === RECOMMENDED_CITATION_LINK}
        >
          Recommended Citation
        </HetListItemButton>
      </Link>
      <HetDivider />
      <Link className='no-underline' to={GLOSSARY_LINK}>
        <HetListItemButton
          className='mx-2 pl-2 font-roboto'
          selected={window.location.pathname === GLOSSARY_LINK}
        >
          Glossary
        </HetListItemButton>
      </Link>
    </nav>
  )
}
