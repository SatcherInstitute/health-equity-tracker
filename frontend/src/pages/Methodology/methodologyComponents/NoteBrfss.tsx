import HetNotice from '../../../styles/HetComponents/HetNotice';

export default function NoteBrfss() {
	return (
		<HetNotice
			className='my-12'
			title="A note about the CDC's Behavioral Risk Factor Surveillance System
		(BRFSS) survey"
		>
			<p>
				It's important to note that because BRFSS is survey-based, it sometimes
				lacks sufficient data for smaller or marginalized racial groups, making
				some estimates less statistically robust.
			</p>
			<p>
				Additionally, the America's Health Rankings analysis of BRFSS data is
				not available at the county level, limiting our tracker's granularity
				for these metrics.
			</p>
		</HetNotice>
	);
}
