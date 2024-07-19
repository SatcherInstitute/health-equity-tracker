import React, { useState } from 'react';
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard';
import { Fips } from '../data/utils/Fips';
import { METRIC_CONFIG, DataTypeConfig } from '../data/config/MetricConfig';
import { MadLib, MADLIB_LIST } from '../utils/MadLibs';

const CustomShareTrendsLineChart: React.FC = () => {
  const [madLib] = useState<MadLib>(() => {
    const initialMadLib = MADLIB_LIST.find((madLib) => madLib.id === 'disparity')!;
    return {
      ...initialMadLib,
      activeSelections: {
        1: 'covid_deaths',
        3: '13121',
      },
    };
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