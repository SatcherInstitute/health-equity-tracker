import HetTerm from "../../styles/HetComponents/HetTerm";

export function RaceRelabelingsList() {
  return (
    <aside className='px-5 pb-10'>
      <h4 className='m-0 pb-5  text-title font-semibold'>
        Race group reclassifications
      </h4>
      <p>To promote inclusion, we reclassify certain race groups from the source data as outlined below:</p>

      <ul>
        <li
          className='pt-1'
        >
          <HetTerm>
            Two or more races
          </HetTerm> replaces the source label ‘Multiracial’.
        </li>

        <li
          className='pt-1'
        >
          <HetTerm>
            Unrepresented
          </HetTerm> replaces the source label ‘Some other race’.
        </li>

        <li
          className='pt-1'
        >
          <HetTerm>
            Indigenous
          </HetTerm> replaces the source label ‘American Indian and Alaska Native’.
        </li>
      </ul>

    </aside>
  )
}