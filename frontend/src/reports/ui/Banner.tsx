import React, { useState, useEffect } from 'react';
import FlagIcon from '@mui/icons-material/Flag';
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes';
import { IconButton } from '@mui/material';
import TextLink from '../../styles/HetComponents/HetTextArrowLink';

const Banner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const bannerClosed = sessionStorage.getItem('bannerClosed');

    if (currentPath === '/exploredata' && currentSearch === '' && !bannerClosed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [window.location.pathname, window.location.search]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('bannerClosed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className="bg-infobarColor text-center p-4" aria-labelledby="banner-heading">
      <div className="flex justify-between">
        <div className="flex lg:flex-row flex-col items-center xs:items-start m-0 p-0">
          <FlagIcon
            className="lg:visible collapse mr-2 text-alertColor"
            aria-hidden="true"
          />
          <p className="text-text p-0 my-0 text-left lg:mr-8" id="banner-heading">
            <span className="font-sansTitle text-title font-bold m-0 p-0">
              Major gaps in the data:
            </span>{' '}
            Structural racism causes health inequities. We’re closing these gaps to improve U.S. health policies.
          </p>
          <TextLink
            link={`${METHODOLOGY_PAGE_LINK}/limitations#missing-data`}
            linkText="Learn more"
            containerClassName="block"
            linkClassName="text-black"
          />
        </div>
        <IconButton
          onClick={handleClose}
          className="banner-close-button p-0 md:my-auto mb-auto xs:mt-[2px]"
          aria-label="Close banner"
        >
          <div className="icon-small w-embed">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12.2 3.80667C11.94 3.54667 11.52 3.54667 11.26 3.80667L7.99998 7.06L4.73998 3.8C4.47998 3.54 4.05998 3.54 3.79998 3.8C3.53998 4.06 3.53998 4.48 3.79998 4.74L7.05998 8L3.79998 11.26C3.53998 11.52 3.53998 11.94 3.79998 12.2C4.05998 12.46 4.47998 12.46 4.73998 12.2L7.99998 8.94L11.26 12.2C11.52 12.46 11.94 12.46 12.2 12.2C12.46 11.94 12.46 11.52 12.2 11.26L8.93998 8L12.2 4.74C12.4533 4.48667 12.4533 4.06 12.2 3.80667Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </IconButton>
      </div>
    </section>
  );
};

export default Banner;