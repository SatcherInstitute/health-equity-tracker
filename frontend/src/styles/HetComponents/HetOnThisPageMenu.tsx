import { useState, useEffect, type ReactNode } from 'react';
import { Events } from 'react-scroll';
import { RouteConfig } from '../../pages/Methodology/methodologyContent/routeConfigs';
import HetReturnToTopFloating from '../../pages/Policy/policyComponents/HetReturnToTopFloating';
import { useScrollToAnchor } from '../../utils/hooks/useScrollToAnchor';

interface HetOnThisPageMenuProps {
  links?: RouteConfig[];
  className?: string;
}

interface CombinedLinkProps {
  to: string;
  isScrollLink: boolean;
  children: React.ReactNode;
  [x: string]: any;
}

function CombinedLink(props: CombinedLinkProps) {
  const { to, isScrollLink, children, ...rest } = props;
  const scrollToAnchor = useScrollToAnchor();

  if (isScrollLink) {
    return (
      <div onClick={() => scrollToAnchor(to)} role="link" {...rest}>
        {children}
      </div>
    );
  }
  return null;
}

export default function HetOnThisPageMenu(props: HetOnThisPageMenuProps) {
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const scrollToAnchor = useScrollToAnchor();

  useEffect(() => {
    const storedActiveLink = sessionStorage.getItem('activeLink');
    if (storedActiveLink) {
      setActiveLink(storedActiveLink);
    }

    Events.scrollEvent.register('end', () => {
      const activeLinkElement = document.querySelector('.active');
      if (activeLinkElement) {
        const newActiveLink = activeLinkElement.getAttribute('to');
        if (newActiveLink) {
          setActiveLink(newActiveLink);
          sessionStorage.setItem('activeLink', newActiveLink);
        }
      }
    });

    return () => {
      Events.scrollEvent.remove('end');
    };
  }, []);

  const handleClick = (path: string) => {
    setActiveLink(path);
    scrollToAnchor(path);
  };

  return (
    <>
      <nav
        aria-label="on this page quick navigation"
        className={`my-2 min-w-40 w-48 max-w-40 text-left flex flex-col grow align-center ${props.className ?? ''}`}
      >
        <ul className="my-1 list-none space-y-1 pl-0 leading-lhTight lg:space-y-2 font-roboto text-smallest">
          {props.links?.map((link) => (
            <li key={link.path}>
              <CombinedLink
                to={link.path}
                isScrollLink
                onClick={() => handleClick(link.path)}
                tabIndex={0}
                className={
                  activeLink === link.path
                    ? 'font-semibold text-altGreen'
                    : 'hover:cursor-pointer text-altBlack'
                }
              >
                {link.label}
              </CombinedLink>
            </li>
          ))}
        </ul>
        <HetReturnToTopFloating />
      </nav>
    </>
  );
}