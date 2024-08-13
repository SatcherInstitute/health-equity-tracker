import { useState, useEffect, type ReactNode } from 'react';
import { Link as ScrollLink, Events } from 'react-scroll';
import { RouteConfig } from '../../pages/Methodology/methodologyContent/routeConfigs';
import HetReturnToTopFloating from '../../pages/Policy/policyComponents/HetReturnToTopFloating';

interface HetOnThisPageMenuProps {
	links?: RouteConfig[];
	className?: string;
}

export default function HetOnThisPageMenu(props: HetOnThisPageMenuProps) {
	const [activeLink, setActiveLink] = useState<string | null>(null);

	useEffect(() => {
		const storedActiveLink = sessionStorage.getItem('activeLink');
		if (storedActiveLink) {
			setActiveLink(storedActiveLink);
		}

		// Scroll event listener
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

		// Cleanup scroll event listener
		return () => {
			Events.scrollEvent.remove('end');
		};
	}, []);

	const handleClick = (path: string) => {
		setActiveLink(path);
	};

	return (
		<>
			<nav
				aria-label='on this page quick navigation'
				className={`my-2 min-w-40 w-48 max-w-40 text-left flex flex-col grow align-center${props.className ?? ''}`}
			>
				<ul className='my-1 list-none space-y-1 pl-0 leading-lhTight lg:space-y-2 font-roboto text-smallest '>
					{props.links?.map((link) => (
						<li key={link.path}>
							<CombinedLink
								to={link.path}
								isScrollLink
								smooth
								duration={200}
								spy
								hashSpy
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
				<HetReturnToTopFloating/>
			</nav>
		</>
	);
}

interface CombinedLinkProps {
	to: string;
	isScrollLink: boolean;
	children: ReactNode;
	[x: string]: any;
}

function CombinedLink(props: CombinedLinkProps) {
	const { to, isScrollLink, children, ...rest } = props;

	if (isScrollLink) {
		return (
			<ScrollLink to={to} {...rest}>
				{children}
			</ScrollLink>
		);
	}
	return null;
};