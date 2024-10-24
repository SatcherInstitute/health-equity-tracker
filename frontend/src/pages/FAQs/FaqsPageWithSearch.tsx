import type React from 'react'
import { useState } from 'react'
import HetAccordion from '../../styles/HetComponents/HetAccordion'
import { consolidatedFaqs } from './FaqsPageData'
import createHighlightedPreview from '../../utils/createHighlightedPreview'

interface Faq {
  question: string
  answer: string | React.ReactNode
}

export default function FaqsPageWithSearch() {
  const [searchQuery, setSearchQuery] = useState('')

  // Reset the search input
  const handleReset = () => {
    setSearchQuery('')
  }

  // Filter FAQs based on search query
  const filteredFaqs = consolidatedFaqs.filter(
    (faq: Faq) =>
      faq.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) || // Filter by question
      (typeof faq.answer === 'string' &&
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())), // Filter by answer (only if it's a string)
  )

  return (
    <>
      {/* Search Input with Enter and Reset Buttons */}
      <div className='flex items-center w-full max-w-lgXl m-auto py-4'>
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search FAQs...'
          className='w-full p-2 border border-altGrey rounded-md'
        />
        <button
          type='button'
          className='ml-2 p-2 bg-green-500 text-white rounded-md'
        >
          Enter
        </button>
        <button
          type='button'
          onClick={handleReset}
          className='ml-2 p-2 bg-red-500 text-white rounded-md'
        >
          Reset
        </button>
      </div>

      {/* Search Results Preview at the Top */}
      <div className='search-results mb-8'>
        {filteredFaqs.map((faq, index) => (
          <div key={index} className='mb-4'>
            <p className='text-text text-altBlack mb-2'>
              {createHighlightedPreview(faq.answer, searchQuery)}
            </p>
          </div>
        ))}
      </div>

      {/* "Jump to Question" Section */}
      <div className='jump-to-questions mt-8'>
        <h2 className='text-title font-semibold mb-4'>Jump to Question</h2>
        <ul>
          {filteredFaqs.map((faq, index) => (
            <li key={index}>
              <a href={`#faq-${index}`} className='text-green-500 underline'>
                {faq.question}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Accordions at the Bottom */}
      <div id='faq-list' className='faq-list mt-8'>
        {filteredFaqs.map((faq, index) => (
          <div key={index} id={`faq-${index}`}>
            <HetAccordion accordionData={[faq]} searchTerm={searchQuery} />
          </div>
        ))}
      </div>
    </>
  )
}
