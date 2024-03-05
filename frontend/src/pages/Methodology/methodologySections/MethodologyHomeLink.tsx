import { Helmet } from 'react-helmet-async';

const MethodologyHomeLink = () => {
	return (
		<section>
			<article>
				<Helmet>
					<title>Methodology - Health Equity Tracker</title>
				</Helmet>
				<h2 className='sr-only'>Methodology</h2>

				<div>
					<p>
						We are committed to principles of{' '}
						<em>Transparency & Accountability,</em> <em>Community First</em>,
						and <em>Open Access</em>, engaging closely with diverse communities
						to shape the overall health narrative and drive actionable policies.
						As we continue to expand our data sources and refine our analyses,
						our goal remains to inform and empower policymakers, while
						highlighting disparities and continually measuring progress towards
						health equity.
					</p>
					<p>
						We need to hear from you. Our team is quickly developing bigger and
						bolder ideas – to expand the tracker not just in terms of breadth of
						health topics covered, but more importantly, in depth – to increase
						the Health Equity Tracker’s utility to reach decision makers at
						every level and especially those involved in advancing policy so
						Health Equity has a seat at the table. We believe data can be
						transformative and that data quality and access is arguably one of
						the most critical determinants of health. We invite you to tell us
						what you are working on to advance Health Equity, and how the we
						might help. In the spirit of collaboration, I hope you will join us
						in saying: <strong>Health Equity for All!</strong>
					</p>
				</div>
			</article>
		</section>
	);
};

export default MethodologyHomeLink;
