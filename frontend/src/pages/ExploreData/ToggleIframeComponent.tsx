import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { useState } from "react";
import { EmbeddedIframe } from "./EmbeddedIframe";

export const ToggleIframeComponent: React.FC<{ index: number, report: any }> = ({ index, report }) => {
	const [showIframe, setShowIframe] = useState<{ [key: number]: boolean }>({});

	const toggleIframe = (index: number) => {
		setShowIframe((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	return (
		<div className="flex flex-col bg-methodologyGreen rounded-md m-8 p-0">
			<button
				onClick={(e) => {
					e.preventDefault();
					toggleIframe(index);
				}}
				className="text-text text-black font-medium no-underline border-none w-auto cursor-pointer bg-methodologyGreen rounded-md py-4"
				aria-expanded={showIframe[index] ? 'true' : 'false'}
				aria-controls={`iframe-${index}`}
			>
				<span className="mx-1">
					{showIframe[index] ? "Hide" : "Preview the data"}
					{showIframe[index] ? <ArrowDropUp /> : <ArrowDropDown />}
				</span>
			</button>
			{showIframe[index] && (
				<EmbeddedIframe
					src={report.iframeSrc}
					key={`iframe-${index}`}
					title={report.title}
					id={`iframe-${index}`}
				/>
			)}
		</div>
	);
};
