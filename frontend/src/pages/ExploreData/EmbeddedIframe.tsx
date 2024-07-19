interface EmbeddedIframeProps {
	src: string;
	title: string;
	id: string;
}

/**
 * Renders an embedded iframe element with the specified source, title, and id.
 *
 * @param {string} src - The URL source of the iframe.
 * @param {string} title - The title of the iframe.
 * @param {string} id - The id attribute of the iframe.
 * @return {JSX.Element} The embedded iframe element.
 */
export const EmbeddedIframe: React.FC<EmbeddedIframeProps> = ({
	src,
	title,
	id,
}) => {
	return (
		<div
			className="px-8 p-2 my-0 bg-methodologyGreen"
			style={{
				width: "100%",
				height: "500px",
				marginTop: "1rem",
				overflow: "hidden",
			}}
		>
			<iframe
				src={src}
				id={id}
				style={{
					width: "200%",
					height: "165%",
					transform: "scale(0.5)",
					transformOrigin: "0 0",
					border: "none",
				}}
				title={title}
				aria-label={title}
				role="document"
			>
				Your browser does not support an iframe.
			</iframe>
		</div>
	);
};
