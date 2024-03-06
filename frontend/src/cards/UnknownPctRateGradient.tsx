import { het } from '../styles/DesignTokens';

export default function UnknownPctRateGradient() {
	return (
		<svg
			height='0'
			version='1.1'
			aria-label='Unknown Pct Rate Gradient'
			role='img'
			xmlns='http://www.w3.org/2000/svg'
		>
			<linearGradient id='gradient'>
				<stop style={{ stopColor: het.unknownMapMost }} offset='0%' />
				<stop style={{ stopColor: het.unknownMapMid }} offset='20%' />
				<stop style={{ stopColor: het.unknownMapMost }} offset='30%' />
				<stop style={{ stopColor: het.unknownMapMid }} offset='40%' />
				<stop style={{ stopColor: het.unknownMapMost }} offset='50%' />
				<stop style={{ stopColor: het.unknownMapMid }} offset='60%' />
				<stop style={{ stopColor: het.unknownMapMost }} offset='70%' />
				<stop style={{ stopColor: het.unknownMapMid }} offset='80%' />
				<stop style={{ stopColor: het.unknownMapMost }} offset='90%' />
				<stop style={{ stopColor: het.unknownMapMid }} offset='100%' />
			</linearGradient>
		</svg>
	);
}
