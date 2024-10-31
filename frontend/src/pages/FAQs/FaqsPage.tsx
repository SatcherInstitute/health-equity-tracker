// import { ABOUT_US_PAGE_LINK } from '../../utils/internalRoutes'
// import { Helmet } from 'react-helmet-async'
// import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
// import { faqMappings } from './FaqsPageData'
// import { CITATION_APA } from '../../cards/ui/SourcesHelpers'
import FaqsPageWithSearch from './FaqsPageWithSearch'

export default function FaqsPage() {
  return <FaqsPageWithSearch />
}

// function FaqsPage() {
//   return (
//     <>
//       <Helmet>
//         <title>FAQ - What Is Health Equity - Health Equity Tracker</title>
//       </Helmet>
//       <h2 className='sr-only'>Frequently Asked Questions</h2>
//       <div className='m-auto flex w-full max-w-lgXl flex-wrap'>
//         <div className='border-0 border-b border-solid border-altGrey px-5 py-12 md:flex'>
//           <div className='w-full md:w-1/4'>
//             <h2
//               className='m-auto pb-5 font-serif text-header font-light'
//               id='main'
//               tabIndex={-1}
//             >
//               Data
//             </h2>
//           </div>
//           <div className='w-full md:w-3/4'>
//             <div className='flex flex-wrap'>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   {faqMappings[4].question}
//                 </h3>
//                 <div className='font-sansText font-normal'>
//                   {faqMappings[4].answer}
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   {faqMappings[2].question}
//                 </h3>
//                 <div className='font-sansText font-normal'>
//                   {faqMappings[2].answer}
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   {faqMappings[3].question}
//                 </h3>
//                 <div className='font-sansText font-normal'>
//                   {faqMappings[3].answer}
//                 </div>
//                 <a href='/datacatalog'>See Data Sources</a>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   What are the inequities in the data?
//                 </h3>
//                 <div className='font-sansText font-normal'>
//                   <ul className='text-small'>
//                     <li>
//                       We’ve seen that many agencies do not reliably collect race
//                       and ethnicity data
//                     </li>
//                     <li>Others that do collect it, fail to report it</li>
//                     <li>
//                       Racial and ethnic categories are often left up to a
//                       person’s interpretation and may not be accurate
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   What principles guide you?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>
//                     It is essential that this work and its resulting products
//                     are done consistently in an ethical manner. One of the core
//                     values of the Health Equity Task Force charged with
//                     developing the Health Equity Tracker is the importance of
//                     working in a way that garners public trust.{' '}
//                   </p>
//                   <h4>
//                     These guiding questions help ensure the right standards are
//                     in place:
//                   </h4>
//                   <ul>
//                     <li>Do we have open access and input in place?</li>
//                     <li>Is there transparency among stakeholders?</li>
//                     <li>
//                       Are we using valid and current data that is reflective of
//                       the realities?
//                     </li>
//                     <li>
//                       Is the community a part of the ownership and authorship of
//                       this work?
//                     </li>
//                     <li>
//                       Have we created a tool that has real value for all
//                       stakeholders including the communities?
//                     </li>
//                     <li>Are we holding our partners accountable?</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className='border-0 border-b border-solid border-altGrey px-5 py-12 md:flex'>
//           <div className='w-full md:w-1/4'>
//             <h2 className='m-auto pb-5 font-serif text-header font-light'>
//               Definitions
//             </h2>
//           </div>
//           <div className='w-full md:w-3/4'>
//             <div className='flex flex-wrap'>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   What is equity?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>
//                     Equity refers to everyone having a fair opportunity to reach
//                     their full potential and no one being disadvantaged from
//                     achieving this potential (Dawes D.E., 2020).
//                   </p>
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   What is the difference between equality and equity?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>
//                     By definition, equality means “the state of being equal,
//                     especially in status, rights, and opportunities.” Equity, in
//                     comparison, “the quality of being fair and just.” Equity
//                     occurs when everyone has access to the necessary tools to
//                     achieve their full potential. Equality occurs when everyone
//                     has the same level and quality of access, which may not
//                     yield fair results.
//                   </p>
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   {faqMappings[0].question}
//                 </h3>
//                 <div className='font-sansText font-normal'>
//                   {faqMappings[0].answer}
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   {faqMappings[1].question}
//                 </h3>
//                 <div className='font-sansText font-normal'>
//                   {faqMappings[1].answer}
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   What are political determinants of health?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>
//                     The political determinants of health create the structural
//                     conditions and the social drivers – including poor
//                     environmental conditions, inadequate transportation, unsafe
//                     neighborhoods, and lack of healthy food options – that
//                     affect all other dynamics of health. (Dawes, D.E. 2020) What
//                     is important to note, is that the political determinants of
//                     health are more than merely separate and distinct from the
//                     social determinants of health, they actually serve as the
//                     instigators of the social determinants that many people are
//                     already well acquainted with.
//                   </p>
//                   <p>
//                     By understanding these political determinants, their
//                     origins, and their impact on the equitable distribution of
//                     opportunities and resources, we can be better equipped to
//                     develop and implement actionable solutions to close the
//                     health gap.
//                   </p>
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   What are social determinants of health?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>
//                     Social determinants of health are conditions in the
//                     environments in which people are born, live, learn, work,
//                     play, worship, and age that affect a wide range of health,
//                     functioning, and quality-of-life outcomes and risks.
//                     (Healthy People 2020, CDC)
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className='border-0 border-b border-solid border-altGrey px-5 py-12 md:flex'>
//           <div className='w-full md:w-1/4'>
//             <h2 className='m-auto pb-5 font-serif text-header font-light'>
//               Take Action
//             </h2>
//           </div>
//           <div className='w-full md:w-3/4'>
//             <div className='flex flex-wrap'>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   How can I get involved?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>
//                     To advance health equity, we need smart, talented,
//                     passionate folks like you on board.
//                   </p>
//                   <ul>
//                     <li>
//                       Sign up for our newsletter to stay up to date with the
//                       latest news
//                     </li>
//                     <li>
//                       Share our site and graphs with your community on social
//                       media
//                     </li>
//                     <li>
//                       <a href={`${ABOUT_US_PAGE_LINK}`}>
//                         Share your health equity story
//                       </a>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3 className='font-sansTitle text-title font-medium'>
//                   How do I share or save the visualizations (graphs, charts,
//                   maps)?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>
//                     In the top-right of each card, there is an icon button with
//                     three horizontal dots like this: <MoreHorizIcon />. Clicking
//                     on this button within each card gives you some options for
//                     exporting the content of the card. You can:
//                   </p>
//                   <ul>
//                     <li>
//                       Copy a link that will navigate back to this exact card on
//                       this exact report
//                     </li>
//                     <li>
//                       Save an image of the entire card as a PNG file to your
//                       device
//                     </li>
//                     <li>
//                       Share the direct card link to multiple social media
//                       platforms as a post
//                     </li>
//                     <li>
//                       Compose a new email on your device with a direct link back
//                       to this card on this report
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//               <div className='w-full pb-5 text-left'>
//                 <h3
//                   className='font-sansTitle text-title font-medium'
//                   id='citation'
//                 >
//                   What is the recommended citation (APA) for the Health Equity
//                   Tracker?
//                 </h3>
//                 <div className='font-sansText text-small font-normal'>
//                   <p>{CITATION_APA}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default FaqsPage
