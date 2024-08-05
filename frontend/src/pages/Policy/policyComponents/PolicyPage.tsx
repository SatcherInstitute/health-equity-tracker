import { Helmet } from "react-helmet-async";
import PolicyHomeLink from "../policySections/PolicyHomeLink";

export default function PolicyPage() {
return (
<>
            <Helmet>
				<title>Policy Context - Health Equity Tracker</title>
			</Helmet>
				<h2 className='sr-only'>Policy</h2>
            <PolicyHomeLink/>
</>
)
}