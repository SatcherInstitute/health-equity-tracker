import {
  EditRounded,
  AssignmentLateRounded,
  PeopleAltRounded,
  FormatListBulletedRounded,
  BlockRounded,
  PublishRounded,
  PrivacyTipRounded,
  CampaignRounded,
} from '@mui/icons-material'

export const submissionGuidelines = [
  {
    icon: <EditRounded />,
    title: 'Purpose of News and Stories',
    number: '1',
    description: (
      <>
        Our articles center on health equity and large-scale public health
        efforts such as ending the HIV epidemic. Address issues related to
        health disparities, social determinants of health, and underserved
        communities.
      </>
    ),
  },
  {
    icon: <PeopleAltRounded />,
    title: 'Personal Stories',
    number: '2',
    description: (
      <>
        We value personal narratives that resonate with readers. Share your own
        experiences related to HIV, health equity, or any related topic.
      </>
    ),
  },
  {
    icon: <AssignmentLateRounded />,
    title: 'Accuracy and Validity',
    number: '3',
    description: (
      <>
        Include evidence-based information and proper citations for statistics,
        studies, or data to enhance the credibility of your story.
      </>
    ),
  },
  {
    icon: <BlockRounded />,
    title: 'Respectful and Inclusive Language',
    number: '4',
    description: (
      <>
        Use language that is respectful and inclusive, avoiding stereotypes or
        stigmatizing attitudes. Our goal is to create a supportive environment
        for readers.
      </>
    ),
  },
  {
    icon: <FormatListBulletedRounded />,
    title: 'Formatting and Length',
    number: '5',
    description: (
      <>
        Structure your story with an introduction, body, and conclusion. Use
        headings or bullet points for clarity, and keep the length manageable.
      </>
    ),
  },
  {
    icon: <BlockRounded />,
    title: 'Plagiarism and Copyright',
    number: '6',
    description: (
      <>
        Your story must be original and unpublished. Provide proper citations
        for any external sources to avoid copyright issues.
      </>
    ),
  },

  {
    icon: <EditRounded />,
    title: 'Editorial Process',
    number: '7',
    description: (
      <>
        Your story will be reviewed and may require revisions. We will notify
        you if it is selected for publication.
      </>
    ),
  },
  {
    icon: <PrivacyTipRounded />,
    title: 'Anonymity and Privacy',
    number: '8',
    description: (
      <>
        Inform us if you want to remain anonymous or use a pseudonym. Your
        personal information will be handled confidentially.
      </>
    ),
  },
  {
    icon: <CampaignRounded />,
    title: 'Publication and Promotion',
    number: '9',
    description: (
      <>
        Published stories will be promoted across our website and social media
        platforms. We will notify you if your story is selected.
      </>
    ),
  },
  {
    icon: <PublishRounded />,
    title: 'Submitting Your Story',
    number: '10',
    description: (
      <>
        Submit your story to{' '}
        <a href='mailto:info@healthequitytracker.org'>
          info@healthequitytracker.org
        </a>{' '}
        with a short bio about yourself and relevant affiliations.
      </>
    ),
  },
]
