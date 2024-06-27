import React, { useState, useEffect } from 'react';
import FlagIcon from '@mui/icons-material/Flag';
import { HashLink } from "react-router-hash-link";
import HetNotice from "../../styles/HetComponents/HetNotice";
import { METHODOLOGY_PAGE_LINK } from "../../utils/internalRoutes";
import { IconButton } from '@mui/material';
import TextLink from './TextLink';

const Banner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        if (currentPath === '/exploredata' && currentSearch === '') {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [window.location.pathname, window.location.search]);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <section className="bg-infobarColor text-center px-4 py-12">
            <div className='flex items-center sm:items-start xs:items-start px-8 mx-8 justify-between'>
                <div className='m-auto pr-16'>
                    <div className='items-flex-start xl:inline-flex lg:inline-flex md:block sm:block xs:block'>
                        <FlagIcon className='xl:inline lg:inline md:hidden mr-2 text-[#d85c47] sm:hidden xs:hidden' />
                        <p className='text-text p-0 m-0 text-left'>
                            <span className="font-sansTitle text-title font-bold">Major gaps in the data:</span> {''}
                            Structural racism causes health inequities; we’re closing these gaps to improve U.S. health policies.
                        </p>
                        <TextLink
                            link={`${METHODOLOGY_PAGE_LINK}/limitations#missing-data`}
                            linkText='Learn more'
                            containerClassName='block mt-0 mr-[auto] xl:ml-4 xl:mt-0 lg:ml-4 lg:mt-0 md:ml-0 md:mt-4 sm:ml-0 sm:mt-4 xs:ml-0 xs:mt-4'
                            linkClassName='text-black mr-[auto] xl:ml-0 lg:ml-0 md:ml-0 sm:mb-0 sm:ml-0 sm:mr-[auto] sm:mt-4 xs:mb-0 xs:ml-0 xs:mr-[auto] xs:mt-4'
                        />
                    </div>
                </div>
                <IconButton onClick={handleClose} className="banner-close-button w-inline-block">
                    <div className="icon-small w-embed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="none">
                            <path d="M12.2 3.80667C11.94 3.54667 11.52 3.54667 11.26 3.80667L7.99998 7.06L4.73998 3.8C4.47998 3.54 4.05998 3.54 3.79998 3.8C3.53998 4.06 3.53998 4.48 3.79998 4.74L7.05998 8L3.79998 11.26C3.53998 11.52 3.53998 11.94 3.79998 12.2C4.05998 12.46 4.47998 12.46 4.73998 12.2L7.99998 8.94L11.26 12.2C11.52 12.46 11.94 12.46 12.2 12.2C12.46 11.94 12.46 11.52 12.2 11.26L8.93998 8L12.2 4.74C12.4533 4.48667 12.4533 4.06 12.2 3.80667Z" fill="currentColor"></path>
                        </svg>
                    </div>
                </IconButton>
            </div>
        </section>
    );
};

export default Banner;