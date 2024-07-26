import { useEffect, useState } from "react";
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useUrlSearchParams } from "../../utils/urlutils";
import {Link, Redirect, Route, Switch} from 'react-router-dom'
import { useIsBreakpointAndUp } from "../../utils/hooks/useIsBreakpointAndUp";
import { OVERVIEW_LINK } from "../../utils/internalRoutes";
import TabOne from "./TabOne";
import { Box, Typography } from "@mui/material";
import React from "react";

interface TabPanelProps{
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  function a11yProps(index: number) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }
  

export default function ContextSectionTabs(){
    const [value, setValue] = React.useState(0);

const handleChange = (event: React.SyntheticEvent, newValue: number) => {
setValue(newValue);
};
    return(
        <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex'}}
      >
        <Tabs
          orientation="vertical"
          
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider' }}
        >
          <Tab label="Crisis Overview" {...a11yProps(0)} />

        </Tabs>
        <TabPanel value={value} index={0}>
          <TabOne/>
        </TabPanel>

      </Box>
    )
}