// import React, { useState, useEffect } from 'react';
// import MapView from './MapView';

// const aliases = {
//   majestic: "Kempegowda Bus Station",
//   kbs: "Kempegowda Bus Station",
//   mejestic: "Kempegowda Bus Station",
//   "city bus stand": "Kempegowda Bus Station",
//   hebbala: "Hebbal",
// };

// const normalize = (input) => {
//   const key = input.toLowerCase().trim();
//   return aliases[key] || input;
// };

// const RouteFinder = () => {
//   const [routes, setRoutes] = useState([]);
//   const [source, setSource] = useState('');
//   const [destination, setDestination] = useState('');
//   const [matches, setMatches] = useState([]);
//   const [selectedRoute, setSelectedRoute] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetch('/routes.json')
//       .then((res) => {
//         if (!res.ok) throw new Error('Failed to fetch routes');
//         return res.json();
//       })
//       .then((data) => setRoutes(data))
//       .catch((err) => {
//         console.error(err);
//         setError('Failed to load routes. Please try again later.');
//       });
//   }, []);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (!source || !destination) {
//       setError('Please enter both source and destination stops.');
//       return;
//     }

//     const s = normalize(source);
//     const d = normalize(destination);

//     const result = routes.filter((route) => {
//       const stops = route.stops.map((stop) => stop.name.toLowerCase());
//       return (
//         stops.some((name) => name.includes(s.toLowerCase())) &&
//         stops.some((name) => name.includes(d.toLowerCase()))
//       );
//     });

//     if (result.length === 0) {
//       setError('No routes found. Try different stops or check spellings.');
//     } else {
//       setError('');
//     }
//     setMatches(result);
//     setSelectedRoute(null);
//   };

//   const uniqueStops = Array.from(
//     new Set(routes.flatMap((route) => route.stops.map((stop) => stop.name)))
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-teal-600 p-6 flex flex-col items-center">
//       <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg animate-pulse mb-8">
//         🚀 BMTC Bus Route Finder
//       </h1>

//       <form
//         onSubmit={handleSearch}
//         className="w-full max-w-4xl flex flex-col md:flex-row gap-4 bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white border-opacity-20"
//       >
//         <input
//           list="stops"
//           className="p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:ring-2 focus:ring-teal-400 focus:outline-none w-full md:w-1/3 transition-all duration-300 hover:bg-opacity-30"
//           placeholder="Source (e.g., Majestic)"
//           value={source}
//           onChange={(e) => setSource(e.target.value)}
//         />
//         <input
//           list="stops"
//           className="p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:ring-2 focus:ring-teal-400 focus:outline-none w-full md:w-1/3 transition-all duration-300 hover:bg-opacity-30"
//           placeholder="Destination (e.g., Whitefield)"
//           value={destination}
//           onChange={(e) => setDestination(e.target.value)}
//         />
//         <datalist id="stops">
//           {uniqueStops.map((stop, idx) => (
//             <option key={idx} value={stop} />
//           ))}
//         </datalist>
//         <button
//           type="submit"
//           className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
//         >
//           🔍 Find Routes
//         </button>
//       </form>

//       {error && (
//         <p className="text-red-300 text-center mt-4 font-semibold animate-bounce">
//           {error}
//         </p>
//       )}

//       {matches.length > 0 ? (
//         <div className="w-full max-w-4xl mt-8 space-y-6">
//           <h2 className="text-2xl font-semibold text-teal-300 drop-shadow-md">
//             ✅ Found {matches.length} Matching Route(s)
//           </h2>
//           {matches.map((route, idx) => (
//             <div
//               key={idx}
//               className="p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-xl border border-white border-opacity-20 transform hover:scale-102 transition-all duration-300"
//             >
//               <p className="text-2xl font-bold text-teal-300">🚌 Route: {route.route_no}</p>
//               <p className="text-white"><strong>From:</strong> {route.origin}</p>
//               <p className="text-white"><strong>To:</strong> {route.destination}</p>
//               <p className="text-white"><strong>Stops:</strong> {route.stops.length}</p>
//               <p className="text-white"><strong>Via:</strong> {route.via.join(', ')}</p>
//               <button
//                 onClick={() => setSelectedRoute(route)}
//                 className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
//               >
//                 🗺️ View on Map
//               </button>
//             </div>
//           ))}
//         </div>
//       ) : (
//         !error && (
//           <p className="text-gray-300 text-center mt-6">
//             Enter stops to find routes!
//           </p>
//         )
//       )}

//       {selectedRoute && (
//         <div className="w-full max-w-4xl mt-10">
//           <h3 className="text-2xl font-bold text-teal-300 mb-4 text-center">
//             🗺️ Route Map: {selectedRoute.route_no}
//           </h3>
//           <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 shadow-2xl">
//             <MapView
//               stops={selectedRoute.stops}
//               source={normalize(source)}
//               destination={normalize(destination)}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RouteFinder;

import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from './SearchBar';
import MapView from './MapView';
import ErrorBoundary from './ErrorBoundary';
const aliases = {
  majestic: 'Kempegowda Bus Station',
  kbs: 'Kempegowda Bus Station',
  mejestic: 'Kempegowda Bus Station',
  'city bus stand': 'Kempegowda Bus Station',
  hebbala: 'Hebbal',
  baleveeranahalli: 'Baleveeranahalli',
  channenahalli: 'Channenahalli',
  'begur bagaluru road': 'Begur Bagaluru Road',
  'chikkanahalli': 'Chikkanahalli',
};

const normalize = (input) => {
  if (!input) return '';
  const key = input.toLowerCase().trim();
  return aliases[key] || input;
};

const RouteFinder = () => {
  const [routes, setRoutes] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Optimize unique stops calculation with useMemo
  const uniqueStops = useMemo(() => {
    return Array.from(
      new Set(routes.flatMap((route) => route.stops.map((stop) => stop.name)))
    ).sort();
  }, [routes]);

  useEffect(() => {
    setIsLoading(true);
    fetch('/routes.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch routes');
        return res.json();
      })
      .then((data) => {
        console.log('Fetched routes:', data);
        setRoutes(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Unable to load routes. Please check your connection or routes.json.');
        setIsLoading(false);
      });
  }, []);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination) {
      setError('Please select both a source and destination stop.');
      setMatches([]);
      setSelectedRoute(null);
      return;
    }

    const s = normalize(source);
    const d = normalize(destination);
    console.log('Normalized search:', { source: s, destination: d });

    // Filter routes and sort by shortest path
    const result = routes
      .map((route) => {
        const stops = route.stops;
        const sourceIdx = stops.findIndex((stop) =>
          stop.name.toLowerCase().includes(s.toLowerCase())
        );
        const destIdx = stops.findIndex((stop) =>
          stop.name.toLowerCase().includes(d.toLowerCase())
        );

        if (sourceIdx === -1 || destIdx === -1) return null;

        // Calculate distance for sorting
        let totalDistance = 0;
        const routeStops = stops.slice(
          Math.min(sourceIdx, destIdx),
          Math.max(sourceIdx, destIdx) + 1
        );
        const validStops = routeStops.filter((stop) => stop.lat && stop.lng);
        if (validStops.length < 2) {
          console.warn(`Route ${route.route_no} skipped: insufficient valid coordinates`);
          return null;
        }

        for (let i = 1; i < routeStops.length; i++) {
          const prev = routeStops[i - 1];
          const curr = routeStops[i];
          if (prev.lat && prev.lng && curr.lat && curr.lng) {
            const dist = haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
            totalDistance += dist;
          }
        }

        return { ...route, totalDistance };
      })
      .filter(Boolean)
      .sort((a, b) => a.totalDistance - b.totalDistance);

    console.log('Search results:', result);

    if (result.length === 0) {
      setError('No valid routes found for the selected stops. Try different stops or check route data.');
      setMatches([]);
      setSelectedRoute(null);
    } else {
      setError('');
      setMatches(result);
      setSelectedRoute(result[0]); // Select the shortest route by default
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-purple-900 p-6 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-cyan-300 mb-10 animate-pulse drop-shadow-lg">
        🚀 BMTC Route Navigator
      </h1>

      <form
        onSubmit={handleSearch}
        className="w-full max-w-5xl flex flex-col md:flex-row gap-4 bg-gray-900 bg-opacity-80 p-6 rounded-xl shadow-2xl border border-cyan-400"
      >
        <SearchBar
          stops={uniqueStops}
          onSelect={setSource}
          placeholder="Source (e.g., Begur Bagaluru Road)"
          className="w-full md:w-1/3 text-white bg-gray-800 border-cyan-400 focus:ring-cyan-300"
        />
        <SearchBar
          stops={uniqueStops}
          onSelect={setDestination}
          placeholder="Destination (e.g., Kempegowda Bus Station)"
          className="w-full md:w-1/3 text-white bg-gray-800 border-cyan-400 focus:ring-cyan-300"
        />
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
        >
          🔍 Discover Routes
        </button>
      </form>

      {isLoading && (
        <div className="mt-6 flex items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-cyan-300 border-t-transparent rounded-full"></div>
          <p className="text-cyan-300 text-lg">Loading routes...</p>
        </div>
      )}
      {error && (
        <p className="text-red-400 mt-6 font-semibold bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg animate-bounce">
          {error}
        </p>
      )}

      {matches.length > 0 ? (
        <div className="w-full max-w-6xl mt-10 flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3 bg-gray-900 bg-opacity-80 rounded-xl p-6 shadow-2xl border border-cyan-400">
  <h3 className="text-2xl font-bold text-cyan-300 mb-4 drop-shadow-md">
    🗺️ Interactive Route Map
  </h3>
  {selectedRoute ? (
    <ErrorBoundary>
      <MapView
        key={`${source}-${destination}-${selectedRoute.route_no}`}
        stops={selectedRoute.stops}
        source={normalize(source)}
        destination={normalize(destination)}
        busNumbers={[selectedRoute.route_no]}
      />
    </ErrorBoundary>
  ) : (
    <p className="text-gray-300">Select a route to view the map.</p>
  )}
</div>
          <div className="md:w-2/3 bg-gray-900 bg-opacity-80 rounded-xl p-6 shadow-2xl border border-cyan-400">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 drop-shadow-md">
              🗺️ Interactive Route Map
            </h3>
            {selectedRoute ? (
              <MapView
                key={`${source}-${destination}-${selectedRoute.route_no}`}
                stops={selectedRoute.stops}
                source={normalize(source)}
                destination={normalize(destination)}
                busNumbers={[selectedRoute.route_no]}
              />
            ) : (
              <p className="text-gray-300">Select a route to view the map.</p>
            )}
          </div>
          <div className="md:w-1/3 bg-gray-900 bg-opacity-80 rounded-xl p-6 shadow-2xl border border-cyan-400">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 drop-shadow-md">
              🚌 Available Routes
            </h3>
            {matches.map((route, idx) => (
              <div
                key={idx}
                className={`mb-4 p-4 bg-gray-800 bg-opacity-60 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all duration-300 ${
                  selectedRoute === route ? 'border-2 border-cyan-300 shadow-cyan-500/50 shadow-md' : ''
                }`}
                onClick={() => setSelectedRoute(route)}
              >
                <p className="text-lg font-semibold text-cyan-300">Route: {route.route_no}</p>
                <p className="text-white">From: {route.origin}</p>
                <p className="text-white">To: {route.destination}</p>
                <p className="text-white">Via: {route.via.join(', ')}</p>
                <p className="text-cyan-400 text-sm">Distance: {route.totalDistance.toFixed(2)} km</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isLoading && (
          <p className="text-gray-300 mt-8 text-lg bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg">
            Enter source and destination stops to discover routes!
          </p>
        )
      )}
      <style jsx>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default RouteFinder;