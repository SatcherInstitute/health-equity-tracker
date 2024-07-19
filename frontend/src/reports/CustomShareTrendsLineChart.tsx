import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard';
import { Fips } from '../data/utils/Fips';
import { METRIC_CONFIG, DataTypeConfig } from '../data/config/MetricConfig';
import { MadLib, MADLIB_LIST } from '../utils/MadLibs';

const CustomShareTrendsLineChart: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [madLib, setMadLib] = useState<MadLib>(() => {
    const initialMadLib = MADLIB_LIST.find((madLib) => madLib.id === 'disparity')!;
    const mls = queryParams.get('mls') || '1.covid-3.13121';
    const dt1 = queryParams.get('dt1') || 'covid_deaths';
    const demo = queryParams.get('age') || 'age';

    const updatedMadLib = {
      ...initialMadLib,
      activeSelections: {
        1: 'covid_deaths',
        3: '13121',
      },
    };

    return updatedMadLib;
  });

  const fips = new Fips('13121'); 
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['covid'][1]; 

  const reportTitle = 'COVID Deaths in Fulton County by Age'; 

  return (
    <div>
      <ShareTrendsChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType='age'
        fips={fips}
        reportTitle={reportTitle}
      />
    </div>
  );
};

export default CustomShareTrendsLineChart;