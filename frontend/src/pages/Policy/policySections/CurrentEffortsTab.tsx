import { Helmet } from 'react-helmet-async'

export default function CurrentEffortsTab() {
	return (
		<>
			<Helmet>
				<title>Current Efforts - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>Current Efforts</h2>
		</>
	)
}