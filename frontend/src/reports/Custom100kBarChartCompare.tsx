import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SimpleBarChartCard from '../cards/SimpleBarChartCard';
import { Fips } from '../data/utils/Fips';
import { METRIC_CONFIG, DataTypeConfig } from '../data/config/MetricConfig';
import { MadLib, MADLIB_LIST } from '../utils/MadLibs';

const Custom100kBarChartCompare: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [madLib, setMadLib] = useState<MadLib>(() => {
    const initialMadLib = MADLIB_LIST.find((madLib) => madLib.id === 'comparevars')!;
    const mls = queryParams.get('mls') || '1.incarceration-3.poverty-5.13';
    const mlp = queryParams.get('mlp') || 'comparevars';
    const dt1 = queryParams.get('dt1') || 'prison';

    const updatedMadLib = {
      ...initialMadLib,
      activeSelections: {
        1: 'incarceration',
        3: 'poverty',
        5: '13', 
      },
    };

    return updatedMadLib;
  });

  const fips = new Fips('13'); 
  const dataTypeConfigIncarceration: DataTypeConfig = METRIC_CONFIG['incarceration'][0]; 
  const dataTypeConfigPoverty: DataTypeConfig = METRIC_CONFIG['poverty'][0]; 

  const reportTitle = 'Prison & Poverty in Georgia by Race'; 

  return (
    <div>
      <div className='grid grid-cols-2'>
        <SimpleBarChartCard 
          dataTypeConfig={dataTypeConfigPoverty}
          demographicType='race_and_ethnicity'
          fips={fips}
          reportTitle={`Poverty in ${fips.getFullDisplayName()}`}
        />
        <SimpleBarChartCard 
          dataTypeConfig={dataTypeConfigIncarceration}
          demographicType='race_and_ethnicity'
          fips={fips}
          reportTitle={`Incarceration in ${fips.getFullDisplayName()}`}
        />
      </div>
    </div>
  );
};

export default Custom100kBarChartCompare;