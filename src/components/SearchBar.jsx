// import React, { useState } from 'react';
// import Fuse from 'fuse.js';

// export default function SearchBar({ stops, onSelect }) {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);

//   const aliases = {
//     "Majestic": "Kempegowda Bus Station",
//     "KBS": "Kempegowda Bus Station",
//     "Shivajinagar": "Shivajinagar Bus Stand",
//     // Add more aliases here
//   };

//   const fuse = new Fuse(stops, { keys: ['name'], threshold: 0.3 });

//   const handleChange = (e) => {
//     const input = e.target.value;
//     setQuery(input);

//     const aliasMatch = aliases[input];
//     const searchTerm = aliasMatch || input;
//     const results = fuse.search(searchTerm).map(res => res.item);
//     setResults(results);
//   };

//   return (
//     <div className="w-full max-w-md mx-auto">
//       <input
//         type="text"
//         value={query}
//         onChange={handleChange}
//         placeholder="Search stop (e.g. Majestic)"
//         className="w-full p-2 border border-gray-300 rounded"
//       />
//       <ul className="bg-white shadow rounded mt-1">
//         {results.map(stop => (
//           <li
//             key={stop.name}
//             onClick={() => { setQuery(stop.name); onSelect(stop.name); }}
//             className="p-2 hover:bg-gray-100 cursor-pointer"
//           >
//             {stop.name}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import debounce from 'lodash/debounce';

export default function SearchBar({ stops, onSelect, placeholder, className }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const aliases = {
    majestic: 'Kempegowda Bus Station',
    kbs: 'Kempegowda Bus Station',
    mejestic: 'Kempegowda Bus Station',
    'city bus stand': 'Kempegowda Bus Station',
    hebbala: 'Hebbal',
    baleveeranahalli: 'Baleveeranahalli',
    channenahalli: 'Channenahalli',
  };

  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(stops.map((name) => ({ name })), {
    keys: ['name'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 1,
    distance: 100,
  });

  // Debounced search function
  const debouncedSearch = debounce((searchTerm) => {
    if (!searchTerm) {
      setResults(stops.slice(0, 5));
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const aliasMatch = Object.keys(aliases).find((key) =>
      key.includes(lowerSearchTerm)
    );
    const finalSearchTerm = aliases[aliasMatch] || searchTerm;

    const searchResults = fuse.search(finalSearchTerm)
      .map((res) => res.item.name)
      .slice(0, 5);

    setResults(searchResults.length > 0 ? searchResults : stops.slice(0, 5));
  }, 300);

  // Handle input change
  const handleChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    setIsOpen(true);
    debouncedSearch(input);
  };

  // Handle stop selection
  const handleSelect = (stop) => {
    setQuery(stop);
    onSelect(stop);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || !results.length) return;

    const currentIndex = results.indexOf(query);
    let newIndex = currentIndex;

    if (e.key === 'ArrowDown') {
      newIndex = (currentIndex + 1) % results.length;
      setQuery(results[newIndex]);
    } else if (e.key === 'ArrowUp') {
      newIndex = (currentIndex - 1 + results.length) % results.length;
      setQuery(results[newIndex]);
    } else if (e.key === 'Enter') {
      if (results[currentIndex]) {
        handleSelect(results[currentIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={inputRef}
        className="p-3 rounded-lg bg-gray-800 bg-opacity-80 text-white border border-cyan-400 focus:ring-2 focus:ring-cyan-300 focus:outline-none w-full transition-all duration-300 hover:bg-opacity-90 hover:shadow-lg hover:shadow-cyan-500/50 placeholder-gray-400"
        aria-label={placeholder}
        autoComplete="off"
      />
      {isOpen && results.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute z-20 w-full bg-gray-900 bg-opacity-95 rounded-lg shadow-2xl mt-1 max-h-60 overflow-y-auto border border-cyan-400"
          role="listbox"
          aria-label="Search results"
        >
          {results.map((stop, index) => (
            <li
              key={stop}
              onMouseDown={() => handleSelect(stop)}
              className={`p-3 cursor-pointer text-white hover:bg-cyan-600 hover:bg-opacity-50 transition-all duration-200 ${
                query === stop ? 'bg-cyan-700 bg-opacity-70' : ''
              }`}
              role="option"
              aria-selected={query === stop}
            >
              {stop}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        input:focus + ul {
          animation: slideDown 0.3s ease-out;
        }
        ul {
          scrollbar-width: thin;
          scrollbar-color: #00ffff #1a1a1a;
        }
        ul::-webkit-scrollbar {
          width: 6px;
        }
        ul::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        ul::-webkit-scrollbar-thumb {
          background: #00ffff;
          border-radius: 3px;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}