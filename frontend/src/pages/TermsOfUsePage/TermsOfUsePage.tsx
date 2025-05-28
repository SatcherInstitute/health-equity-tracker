interface TermsContent {
  title: string
  paragraphs: React.ReactNode | string
}

const termsOfUseContent: TermsContent[] = [
  {
    title: 'Privacy Policy',
    paragraphs: [
      `The Health Equity Tracker (HET), a project of the Satcher Health Leadership Institute (SHLI) at Morehouse School of Medicine (MSM), is committed to protecting your online privacy. The only information HET obtains about individual visitors to this web application is information supplied voluntarily by visitors. This policy outlines HET's practices regarding the collection and use of your personal information during your visit to our web application.`,
    ],
  },
  {
    title: 'Personally Provided Information',
    paragraphs: [
      `In general, you can visit the Health Equity Tracker without revealing any personal information. If you choose to provide us with personal information by sending an email or submitting a news article for us to review and potentially publish, we use that information to respond to your message and help provide you with requested information or material. HET does not give, share, sell, or transfer any personal information to third parties unless required by law.`,
    ],
  },
  {
    title: 'Email and Phone Communications',
    paragraphs: [
      `Email communications sent to us via contact forms on our site or through phone calls may be shared with a customer service representative, employee, HET partner, or subject matter expert best qualified to address your inquiry. We make every effort to respond in a timely fashion once communications are received.`,
    ],
  },
  {
    title: 'Collection of Technical Information',
    paragraphs: [
      `The Health Equity Tracker uses IP addresses (the Internet address of your computer) to help diagnose problems with our servers and administer our site. We run statistical software to identify heavily used parts of our site and analyze our audience composition. However, we do not link IP addresses to anything personally identifiable.`,
      `Like many other web applications, the Health Equity Tracker uses cookies. This is typically done to recognize you and your access privileges on the site. These cookies are stored on your computer, never contain personal data, and cannot be accessed remotely by anybody other than certain HET staffers.`,
      `While aggregate statistical reports may be generated based on site usage, no personally identifiable information will ever be disseminated to any unaffiliated third party.`,
    ],
  },
  {
    title: 'Security',
    paragraphs: [
      `While no computing environment can be 100% secure, HET is committed to maintaining as secure a technical environment as feasible given current technological capabilities. As a SHLI project within MSM, HET complies with all state and federal statutes requiring additional safeguards for certain types of information, including personally identifiable information and protected health information.`,
    ],
  },
  {
    title: 'Links to Other Sites',
    paragraphs: [
      `Please note that some pages within the Health Equity Tracker may contain links to external websites not managed by HET, SHLI, or MSM. These links are provided for user convenience. HET does not review, control, or take responsibility for the content of these websites. Once you visit a link to another site, you are subject to the privacy policy of that new website.`,
    ],
  },
  {
    title: 'Changes to our Privacy Policy',
    paragraphs: [
      `We may change the terms and conditions of our Privacy Policy at any time by posting revisions on the Health Equity Tracker website. By accessing or using the HET website, you agree to be bound by all the terms and conditions of our Privacy Policy as posted at the time of your access or use. If you do not agree to the terms of this Privacy Policy or any revised statement, please exit the site immediately.`,
    ],
  },
  {
    title: 'Complaint Process',
    paragraphs: (
      <>
        If you have a complaint or problem with the Health Equity Tracker
        website, or if you believe your privacy rights have been violated,
        please email us at{' '}
        <a href='mailto:info@healthequitytracker.org'>
          info@healthequitytracker.org
        </a>
        . Please indicate the reason for contacting us. The core HET team will
        review your complaint for response or resolution.
      </>
    ),
  },
  {
    title: 'Disclaimer',
    paragraphs: [
      `No data protection method or combination of methods can be guaranteed as completely secure. The Health Equity Tracker is not responsible for and will not be held liable for disclosures of your personal information due to transmission errors or unauthorized acts of third parties. HET does not guarantee the privacy of confidential information transmitted to its website should you choose not to use the appropriate secure online forms provided. By using this website, you agree to the terms and conditions outlined in this Terms of Use statement.`,
    ],
  },
]

export default function TermsOfUsePage() {
  return (
    <>
      <title>Terms of Use - Health Equity Tracker</title>

      <section
        id='main-content'
        className='mx-auto flex w-svw max-w-lg-xl flex-col justify-center px-8 py-16'
      >
        <h1
          id='main'
          className='font-bold font-sans-title text-alt-green text-big-header leading-lh-normal'
        >
          Terms of Use
        </h1>
        <ul className='mx-auto w-full max-w-lg list-none p-0 text-left md:w-3/4'>
          {termsOfUseContent.map((tou, index) => (
            <li key={tou.title} className='pb-5' id={`tou-${index}`}>
              <h2 className='mt-0 font-medium font-sans-title text-alt-green text-title'>
                {tou.title}
              </h2>
              <p key={tou.title} className='font-sans-text text-small'>
                {tou.paragraphs}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
