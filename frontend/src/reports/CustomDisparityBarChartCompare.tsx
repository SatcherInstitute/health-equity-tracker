import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DisparityBarChartCard from '../cards/DisparityBarChartCard';
import { Fips } from '../data/utils/Fips';
import { METRIC_CONFIG, DataTypeConfig } from '../data/config/MetricConfig';
import { MadLib, MADLIB_LIST } from '../utils/MadLibs';

const CustomDisparityBarChartCompare: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [madLib, setMadLib] = useState<MadLib>(() => {
    const initialMadLib = MADLIB_LIST.find((madLib) => madLib.id === 'comparegeos')!;
    const mls = queryParams.get('mls') || '1.health_insurance-3.12-5.06';
    const mlp = queryParams.get('mlp') || 'comparegeos';
    const demo = queryParams.get('demo') || 'sex';

    const updatedMadLib = {
      ...initialMadLib,
      activeSelections: {
        1: 'health_insurance',
        3: '12',  
        5: '06',  
      },
    };

    return updatedMadLib;
  });

  const fipsFlorida = new Fips('12'); 
  const fipsCalifornia = new Fips('06'); 
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['health_insurance'][0]; 

  const reportTitle = 'Uninsurance in FL & CA by Sex'

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div style={{ flex: 1, margin: '0 10px' }}>
        <DisparityBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType='sex'
          fips={fipsFlorida}
          reportTitle={`Uninsurance in Florida by Sex`}
        />
      </div>
      <div style={{ flex: 1, margin: '0 10px' }}>
        <DisparityBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType='sex'
          fips={fipsCalifornia}
          reportTitle={`Uninsurance in FL & CA by Sex`}
        />
      </div>
    </div>
  );
};

export default CustomDisparityBarChartCompare;