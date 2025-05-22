// import React, { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix for Leaflet default marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// const MapView = ({ stops, source, destination }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);

//   useEffect(() => {
//     if (!mapRef.current || !stops || stops.length === 0) return;

//     // Initialize map
//     if (!mapInstance.current) {
//       mapInstance.current = L.map(mapRef.current, {
//         center: [12.9716, 77.5946], // Default to Bangalore coordinates
//         zoom: 12,
//         layers: [
//           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//           }),
//         ],
//       });
//     }

//     // Clear existing layers
//     mapInstance.current.eachLayer((layer) => {
//       if (layer instanceof L.Marker || layer instanceof L.Polyline) {
//         mapInstance.current.removeLayer(layer);
//       }
//     });

//     // Filter stops between source and destination
//     const sourceIdx = stops.findIndex((stop) =>
//       stop.name.toLowerCase().includes(source.toLowerCase())
//     );
//     const destIdx = stops.findIndex((stop) =>
//       stop.name.toLowerCase().includes(destination.toLowerCase())
//     );

//     if (sourceIdx === -1 || destIdx === -1) {
//       console.error('Source or destination not found in stops');
//       return;
//     }

//     const routeStops = stops.slice(
//       Math.min(sourceIdx, destIdx),
//       Math.max(sourceIdx, destIdx) + 1
//     );

//     // Add markers and polyline
//     const coords = routeStops
//       .filter((stop) => stop.lat && stop.lng) // Ensure valid coordinates
//       .map((stop) => [stop.lat, stop.lng]);

//     if (coords.length === 0) {
//       console.error('No valid coordinates for stops');
//       return;
//     }

//     // Add markers
//     routeStops.forEach((stop, idx) => {
//       if (stop.lat && stop.lng) {
//         const marker = L.marker([stop.lat, stop.lng], {
//           icon: L.icon({
//             iconUrl:
//               idx === 0
//                 ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
//                 : idx === routeStops.length - 1
//                 ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
//                 : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//             iconSize: [25, 41],
//             iconAnchor: [12, 41],
//             popupAnchor: [1, -34],
//           }),
//         })
//           .addTo(mapInstance.current)
//           .bindPopup(`<b>${stop.name}</b>`);
//       }
//     });

//     // Draw polyline
//     L.polyline(coords, {
//       color: '#ff00ff',
//       weight: 5,
//       opacity: 0.7,
//       dashArray: '10, 10',
//       lineCap: 'round',
//     }).addTo(mapInstance.current);

//     // Fit map to bounds
//     mapInstance.current.fitBounds(coords);

//     return () => {
//       if (mapInstance.current) {
//         mapInstance.current.remove();
//         mapInstance.current = null;
//       }
//     };
//   }, [stops, source, destination]);

//   return (
//     <div
//       ref={mapRef}
//       className="w-full h-[500px] rounded-lg shadow-lg border border-white border-opacity-20"
//     />
//   );
// };

// export default MapView;
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ stops, source, destination, busNumbers = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapError, setMapError] = useState('');
  const [coords, setCoords] = useState([]);

  useEffect(() => {
    console.log('MapView props:', { stops, source, destination, busNumbers });

    if (!mapRef.current || !stops?.length || !source || !destination) {
      setMapError('Missing required data: stops, source, or destination.');
      console.warn('MapView: Missing required props', { stops, source, destination });
      return;
    }

    // Initialize map
    if (!mapInstance.current) {
      try {
        mapInstance.current = L.map(mapRef.current, {
          center: [12.9716, 77.5946], // Bengaluru default center
          zoom: 12,
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(mapInstance.current);
      } catch (err) {
        console.error('MapView: Failed to initialize map', err);
        setMapError('Failed to initialize map. Please try again.');
        return;
      }
    }

    // Clear existing layers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Find source and destination indices
    const sourceIdx = stops.findIndex((stop) =>
      stop.name.toLowerCase().includes(source.toLowerCase())
    );
    const destIdx = stops.findIndex((stop) =>
      stop.name.toLowerCase().includes(destination.toLowerCase())
    );

    if (sourceIdx === -1 || destIdx === -1) {
      console.warn('MapView: Source or destination not found', { source, destination, stops });
      setMapError('Source or destination stop not found in the route.');
      return;
    }

    // Extract route stops and coordinates
    const routeStops = stops.slice(Math.min(sourceIdx, destIdx), Math.max(sourceIdx, destIdx) + 1);
    const routeCoords = routeStops
      .filter((stop) => stop.lat && stop.lng && !isNaN(stop.lat) && !isNaN(stop.lng))
      .map((stop) => [stop.lat, stop.lng]);

    console.log('MapView: Route stops and coords', { routeStops, routeCoords });

    if (routeCoords.length < 2) {
      console.warn('MapView: Insufficient valid coordinates', { routeStops, routeCoords });
      setMapError('Unable to display map: At least two stops with valid coordinates are required.');
      setCoords([]);
      return;
    }

    setCoords(routeCoords);
    setMapError('');

    // Add markers
    routeStops.forEach((stop, idx) => {
      if (stop.lat && stop.lng && !isNaN(stop.lat) && !isNaN(stop.lng)) {
        const isSource = idx === 0;
        const isDest = idx === routeStops.length - 1;
        L.marker([stop.lat, stop.lng])
          .addTo(mapInstance.current)
          .bindPopup(
            `<b>${stop.name}</b><br>Buses: ${busNumbers.join(', ')}`,
            { autoClose: false, closeOnClick: false }
          )
          .openPopup();
      }
    });

    // Add polyline
    L.polyline(routeCoords, { color: 'blue', weight: 4 }).addTo(mapInstance.current);

    // Fit map to bounds
    mapInstance.current.fitBounds(routeCoords, { padding: [50, 50] });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [stops, source, destination, busNumbers]);

  return (
    <div className="relative w-full h-[500px] border border-gray-400">
      <div ref={mapRef} className="w-full h-full" />
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-white text-lg font-semibold bg-gray-900 p-4 rounded">
            {mapError}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;