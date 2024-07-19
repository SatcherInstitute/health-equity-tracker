import React, { useState } from 'react';
import { Fips } from '../data/utils/Fips';
import { METRIC_CONFIG, DataTypeConfig } from '../data/config/MetricConfig';
import RateTrendsChartCard from '../cards/RateTrendsChartCard';
import { MadLib, MADLIB_LIST, getMadLibWithUpdatedValue } from '../utils/MadLibs';

const CustomRateTrendsLineChart: React.FC = () => {
  const [madLib, setMadLib] = useState<MadLib>(() => {
    const initialMadLib = MADLIB_LIST.find((madLib) => madLib.id === 'disparity')!;
    return initialMadLib;
  });

  const fips = new Fips('00');
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['hiv'][0];
  const reportTitle = 'Example Report Title';

  const updateFipsCallback = (fips: Fips) => {
    setMadLib(getMadLibWithUpdatedValue(madLib, 3, fips.code));
  };

  return (
    <div>
      <RateTrendsChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType='race_and_ethnicity'
        fips={fips}
        reportTitle={reportTitle}
      />
    </div>
  );
};

export default CustomRateTrendsLineChart;