import {
	Table,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';

interface CodeData {
	content: string | JSX.Element;
}

interface CodeBlockProps {
	rowData: CodeData[];
	border?: boolean;
	minWidth?: number | string;
}

export function CodeBlock(props: CodeBlockProps) {
	const border = props?.border ?? true;
	return (
		<TableContainer>
			<Table
				className={
					border
						? 'mx-auto my-1 flex rounded-md border border-solid border-greyGridColor p-1'
						: 'mx-auto my-1 flex border-none p-1'
				}
				aria-label='customized table'
			>
				<TableHead>
					<TableRow>
						{props.rowData.map((cell) => (
							<TableCell
								className='flex content-baseline'
								key={cell.content.toString()}
							>
								<pre className='mx-auto my-0 border-none bg-opacity-0'>
									{cell.content}
								</pre>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
			</Table>
		</TableContainer>
	);
}
