import React, { useState, useEffect } from 'react';
import { routeConfigs } from '../methodologyContent/routeConfigs';

interface SearchResult {
  mainLabel: string;
  subLabel?: string;
}
const SearchBar = () => {
  const searchMethodology = (query: string) => {
    const results: SearchResult[] = [];
    // Make the search case-insensitive
    const caseInsensitiveQuery = query.toLowerCase();
    // Loop through each main route
    for (const route of routeConfigs) {
      const mainLabel = route.label.toLowerCase();

      // Check if the main label matches the query
      if (mainLabel.includes(caseInsensitiveQuery)) {
        results.push({ mainLabel: route.label });
      }

      // Loop through each subLink in the main route
      for (const subLink of route.subLinks) {
        const subLabel = subLink.label.toLowerCase();

        // Check if the sub label matches the query
        if (subLabel.includes(caseInsensitiveQuery)) {
          results.push({ mainLabel: route.label, subLabel: subLink.label });
        }
      }
    }

    // Log the results for now

    console.log("Search Results:", results);




    return results;
  };


  // const SearchBar: React.FC = () => {
  // searchMethodology("HIV")

  //   const [query, setQuery] = useState<string>('');
  //   const [results, setResults] = useState<SearchResult[]>([]);

  //   useEffect(() => {
  //     if (query.length > 0) {
  //       const newResults = searchMethodology(query);
  //       setResults(newResults);
  //       console.log('Search Results:', newResults);
  //     } else {
  //       setResults([]);
  //     }
  //   }, [query]);

  //   return (
  //     <div>
  //       <input
  //         type="text"
  //         placeholder="Search methodology..."
  //         value={query}
  //         onChange={(e) => { setQuery(e.target.value); }}
  //       />
  //       {results.length > 0 && (
  //         <ul>
  //           {results.map((result, index) => (
  //             <li key={index}>
  //               {result.mainLabel} {result.subLabel && `> ${result.subLabel}`}
  //             </li>
  //           ))}
  //         </ul>
  //       )}
  //     </div>
  //   );
};

export default SearchBar;
