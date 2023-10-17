interface Dataset {
    title: string;
    introduction: string;
    dataSources: {
        origin: string;
        timeframe?: string;
        geographicLevel: string;
        demographicGranularity: string;
        dataCollection: {
            updateFrequency: string;
            sourceWebsite: string;
        };
        notes?: string;
    };
}

const datasets: Dataset[] = [
    {
        title: "CDC Case Surveillance Restricted Access Detailed Data",
        introduction: "This dataset provides comprehensive information on confirmed COVID-19 deaths, cases, and hospitalizations at national, state, and county levels.",
        dataSources: {
            origin: "Centers for Disease Control and Prevention, COVID-19 Response.",
            timeframe: "January 2020 - Current",
            geographicLevel: "National, State, County",
            demographicGranularity: "Race/ethnicity, age, sex",
            dataCollection: {
                updateFrequency: "Monthly",
                sourceWebsite: "data.cdc.gov",
            },
            notes: "The last case data included is two (2) weeks before the most recent release from the CDC. Data is presented as rates calculated with the American Community Survey (ACS) 2019 5-year estimates."
        },
        // ... (Similar structure for the other datasets)
    },
];

const DatasetTable = () => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Introduction</th>
                    <th>Origin</th>
                    <th>Timeframe</th>
                    <th>Geographic Level</th>
                    <th>Demographic Granularity</th>
                    <th>Update Frequency</th>
                    <th>Source Website</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                {datasets.map((dataset) => (
                    <tr key={dataset.title}>
                        <td>{dataset.title}</td>
                        <td>{dataset.introduction}</td>
                        <td>{dataset.dataSources.origin}</td>
                        <td>{dataset.dataSources.timeframe}</td>
                        <td>{dataset.dataSources.geographicLevel}</td>
                        <td>{dataset.dataSources.demographicGranularity}</td>
                        <td>{dataset.dataSources.dataCollection.updateFrequency}</td>
                        <td>{dataset.dataSources.dataCollection.sourceWebsite}</td>
                        <td>{dataset.dataSources.notes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default DatasetTable;
