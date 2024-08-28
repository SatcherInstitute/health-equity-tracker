import HetCTABig from '../../styles/HetComponents/HetCTABig'

export default function ShareYourStory() {
  return (
    <div className='flex w-full items-center justify-center text-start'>
      <div className='flex max-w-md flex-wrap justify-center p-5'>
        <div className='px-16 pb-4 pt-24'>
          <h2
            id='main'
            className='m-0 text-center font-serif text-header font-light text-altGreen md:text-bigHeader'
          >
            Call for Community Writers
          </h2>
          <h3 className='m-0 pb-4	text-center font-sansText text-title	font-normal md:text-smallestHeader'>
            Share Your Story and Amplify Your Voice
          </h3>
        </div>

        <p className='px-1'>
          We believe that everyone's voice matters when it comes to health
          equity and ending the HIV epidemic. We invite community members,
          advocates, and individuals directly affected by HIV to share their
          personal stories, insights, and experiences on our ‘New and Stories’
          page. By contributing, you can help raise awareness, foster
          understanding, and inspire positive change in underserved communities.
          To ensure the quality and credibility of the content, we kindly ask
          you to follow the guidelines outlined below.
        </p>

        <div className='mt-5 flex w-full items-center'>
          <div className='flex-1 border-0 border-t border-solid border-altGrey'></div>
          <h3 className='m-0 pe-4 ps-4 text-center font-serif text-smallestHeader font-light text-altGreen'>
            Submission guidelines
          </h3>
          <div className='flex-1 border-0 border-t border-solid border-altGrey'></div>
        </div>

        <ul className='list-none'>
          <li className='p-3'>
            <b>Purpose of News and Stories:</b> Our articles focus on health
            equity and large-scale public health efforts such as ending the HIV
            epidemic. Please align your story with these topics, addressing
            issues related to health disparities, social determinants of health,
            barriers to access and care, and the impact on underserved
            communities.
          </li>

          <li className='p-3'>
            <b>Personal Stories:</b> We value personal narratives that
            authentically express a unique perspective and resonate with
            readers. Share your own experiences related to HIV, health equity,
            or any related aspect you feel is relevant.
          </li>

          <li className='p-3'>
            <b>Accuracy and Validity:</b> We encourage you to include
            evidenced-based information in your story whenever possible. If you
            mention statistics, studies, or any specific data, please provide
            credible references. Use reputable sources such as scientific
            journals, government reports, or recognized health organizations to
            support your claims.
          </li>

          <li className='p-3'>
            <b>Respectful and Inclusive Language:</b> Maintain a respectful and
            inclusive tone throughout your writing. Avoid offensive language,
            stereotypes, or stigmatizing attitudes. Our goal is to foster a safe
            and supportive environment for readers from diverse backgrounds.
          </li>

          <li className='p-3'>
            <b>Formatting and Length:</b> Structure your story with an
            introduction, body, and conclusion. Aim for a length of under 2000
            words to maintain readability and engagement. Feel free to include
            headings, subheadings, or bullet points to enhance clarity and
            organization.
          </li>

          <li className='p-3'>
            <b>Plagiarism and Copyright:</b> Ensure that your story is original
            and not published elsewhere. Plagiarism or copyright infringement
            will not be tolerated. If you include any external sources, provide
            proper citations and give credit to the original authors.
          </li>

          <li className='p-3'>
            <b>Submitting Your Story:</b> To contribute, please send your story
            as a Word document or Google Doc to{' '}
            <a href='mailto:info@healthequitytracker.org'>
              info@healthequitytracker.org
            </a>
            . Include a brief bio (2-3 sentences) introducing yourself and any
            relevant affiliations or experiences you would like to share.
          </li>

          <li className='p-3'>
            <b>Editorial Process:</b> All submissions will go through an
            editorial process to ensure clarity, grammar, and adherence to the
            guidelines. You may be requested to revise your story based on
            feedback from our editorial team. We will notify you if your story
            is selected for publication.
          </li>

          <li className='p-3'>
            <b>Anonymity and Privacy:</b> If you prefer to remain anonymous or
            use a pseudonym, please let us know in your submission email. We
            respect your privacy and will handle your personal information with
            utmost confidentiality.
          </li>

          <li className='p-3'>
            <b>Publication and Promotion:</b> While we cannot guarantee that all
            submissions will be published, we appreciate your contribution and
            will notify you if your story is selected. Published stories will be
            promoted on our website and various social media platforms,
            amplifying their reach and impact.
          </li>
        </ul>

        <div className='m-10 flex w-full items-center'>
          <div className='flex-1 border-0 border-t border-solid border-altGrey'></div>
        </div>

        <p className='px-1'>
          Thank you for considering sharing your story with us. Your voice can
          make a difference in advancing health equity for all people. We look
          forward to hearing from you and appreciate your support in creating a
          more inclusive and informed community.
        </p>
        <div className='mt-20 flex justify-center'>
          <HetCTABig href='mailto:info@healthequitytracker.org'>
            Share your story
          </HetCTABig>
        </div>
      </div>
    </div>
  )
}
