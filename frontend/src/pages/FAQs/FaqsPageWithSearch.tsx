import type React from 'react'
import { useState, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import HetAccordion from '../../styles/HetComponents/HetAccordion'
import { consolidatedFaqs } from './FaqsPageData'
import createHighlightedPreview from '../../utils/createHighlightedPreview'

interface Faq {
  question: string
  answer: string | React.ReactNode
}

function reactNodeToString(node: ReactNode): string {
  if (typeof node === 'string') return node
  return renderToStaticMarkup(node as JSX.Element)
}

export default function FaqsPageWithSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFaqs, setFilteredFaqs] = useState<Faq[] | null>(null)

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch()
    }
  }

  // Perform the search
  const performSearch = () => {
    if (searchQuery.trim() !== '') {
      const newFilteredFaqs = consolidatedFaqs.filter((faq: Faq) => {
        const answerText =
          typeof faq.answer === 'string'
            ? faq.answer
            : reactNodeToString(faq.answer)

        return (
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          answerText.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      setFilteredFaqs(newFilteredFaqs)
    } else {
      // If search query is empty, reset filteredFaqs to null to show all FAQs
      setFilteredFaqs(null)
    }
  }

  // Reset the search input
  const handleReset = () => {
    setSearchQuery('')
    setFilteredFaqs(null)
  }

  // The FAQs to display: if filteredFaqs is null, show all; else, show filtered
  const faqsToDisplay = filteredFaqs !== null ? filteredFaqs : consolidatedFaqs

  return (
    <>
      {/* Search Input with Enter and Reset Buttons */}
      <div className='flex items-center w-full max-w-lgXl m-auto py-4'>
        <input
          type='text'
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder='Search FAQs...'
          className='w-full p-2 border border-altGrey rounded-md'
        />
        <button
          type='button'
          onClick={performSearch}
          className='ml-2 p-2 bg-green-500 text-white rounded-md'
        >
          Search
        </button>
        <button
          type='button'
          onClick={handleReset}
          className='ml-2 p-2 bg-red-500 text-white rounded-md'
        >
          Reset
        </button>
      </div>

      {/* Only show the following sections if a search has been performed and there are results */}
      {filteredFaqs !== null && (
        <>
          {/* Search Results Preview */}
          {filteredFaqs.length > 0 ? (
            <>
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
                <h2 className='text-title font-semibold mb-4'>
                  Jump to Question
                </h2>
                <ul>
                  {filteredFaqs.map((faq, index) => (
                    <li key={index}>
                      <a
                        href={`#faq-${index}`}
                        className='text-green-500 underline'
                      >
                        {faq.question}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p>No FAQs match your search.</p>
          )}
        </>
      )}

      {/* Accordions */}
      <div id='faq-list' className='faq-list mt-8'>
        {faqsToDisplay.map((faq, index) => (
          <div key={index} id={`faq-${index}`}>
            <HetAccordion accordionData={[faq]} searchTerm={searchQuery} />
          </div>
        ))}
      </div>
    </>
  )
}
