import React, { useState } from 'react';
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material';

interface LinkType {
    to: string;
    index: number;
    primary: string;
    secondary?: string;
    paddingLeft?: number;
}

const links: LinkType[] = [
    // Add your links here in the format:
    // { to: '/some-path', index: 0, primary: 'Some text', secondary: 'Some secondary text', paddingLeft: 2 }
];

const MethodologyCardMenuMobile: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleSelected = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedIndex(event.target.value as number);
    };

    return (
        <FormControl fullWidth variant="outlined">
            <InputLabel id="methodology-select-label">Methodology</InputLabel>
            <Select
                labelId="methodology-select-label"
                value={selectedIndex}
                onChange={handleSelected}
                label="Methodology"
            >
                {links.map((link, idx) => (
                    <MenuItem key={idx} value={link.index}>
                        {link.primary}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default MethodologyCardMenuMobile;


// import React, { useState, type ReactElement } from 'react';
// import AppBar from '@mui/material/AppBar';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
// import CssBaseline from '@mui/material/CssBaseline';
// import useScrollTrigger from '@mui/material/useScrollTrigger';
// import Box from '@mui/material/Box';
// import Container from '@mui/material/Container';
// import Fab from '@mui/material/Fab';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// import Fade from '@mui/material/Fade';
// import Select from '@mui/material/Select';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// interface Props {
//     window?: () => Window;
//     children: React.ReactElement;
// }

// const BorderSelect = () => {
//     const [val, setVal] = useState(1);
//     const handleChange = (event: { target: { value: React.SetStateAction<number>; }; }) => {
//         setVal(event.target.value);
//     };

//     const menuProps = {
//         anchorOrigin: { vertical: "bottom", horizontal: "left" },
//         transformOrigin: { vertical: "top", horizontal: "left" },
//         getContentAnchorEl: null
//     };

//     const iconComponent = (props: { className: string | undefined; }) => {
//         return <ExpandMoreIcon className={props.className} />;
//     };

//     return (
//         <FormControl>
//             <InputLabel id="inputLabel">LABEL</InputLabel>
//             <Select
//                 labelId="inputLabel"
//                 IconComponent={iconComponent}
//                 MenuProps={menuProps}
//                 value={val}
//                 onChange={handleChange}
//             >
//                 <MenuItem value={0}>None</MenuItem>
//                 <MenuItem value={1}>One</MenuItem>
//                 <MenuItem value={2}>Two</MenuItem>
//                 <MenuItem value={3}>Three</MenuItem>
//             </Select>
//         </FormControl>
//     );
// };

// function ScrollTop(props: Props): ReactElement {
//     const { children, window } = props;
//     // Note that you normally won't need to set the window ref as useScrollTrigger
//     // will default to window.
//     // This is only being set here because the demo is in an iframe.
//     const trigger = useScrollTrigger({
//         target: window ? window() : undefined,
//         disableHysteresis: true,
//         threshold: 100,
//     });
// }

// export default function MethodologyCardMenuMobile(props: Props) {
//     return (
//         <React.Fragment>
//             <CssBaseline />
//             <AppBar>
//                 <Toolbar>
//                     <Typography variant="h6" component="div">
//                         Scroll to see button
//                     </Typography>
//                 </Toolbar>
//             </AppBar>
//             <Toolbar id="back-to-top-anchor" />
//             <Container>
//                 <Box sx={{ my: 2 }}>
//                     {[...new Array(12)]
//                         .map(
//                             () => `Cras mattis consectetur purus sit amet fermentum.
// Cras justo odio, dapibus ac facilisis in, egestas eget quam.
// Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
// Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`,
//                         )
//                         .join('\n')}
//                 </Box>
//             </Container>
//             {/* The floating button */}
//             <Fab size="small" aria-label="scroll back to top">
//                 <KeyboardArrowUpIcon />
//             </Fab>
//         </React.Fragment>
//     );
// }