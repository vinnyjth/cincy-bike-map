import React, { useState, useRef } from "react";
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import AutoComplete from 'react-google-autocomplete'

// const loader = new Loader({
//     apiKey: "AIzaSyCgNwEUrjufQRo5zHlCKgJNnXmOgkk_uCI",
//     version: "weekly",
// });

export const Geo = {
  forwardGeocode: async ({ query }) => {
    const geocoder = new window.google.maps.Geocoder();
    let results = []
    try {
      const result = await geocoder.geocode({ address: query, region: "us" });
      results = result.results
    } catch (e){
      console.error(e)
    }
    return {
      type: "FeatureCollection",
      query: [query],
      features: results.map(result => ({
        type: "Feature",
        id: result.place_id,
        geometry: {
          "type": "Point",
          coordinates: [result.geometry.location.lng(), result.geometry.location.lat()]
        }
      }))
    }
  },
};


const Geocoder = ({ start = false, onSubmit }) => {
  const [place, setPlace] = useState(null);

  const handleSubmit = async () => {
    onSubmit(place)
  }

  

  return (
    <div className="flex">
      <div className="w-12 h-12 flex justify-center bg-[#B0CA9D] items-center border-0">
        <span className="">{start ? 'Start' : 'End'}</span>
      </div>
      {/* <input className="outline-none" onBlur={handleSubmit}></input> */}
      <AutoComplete
        apiKey={'AIzaSyAjFVcqFqo9iH-14jr2oulSZ8anN-DeC6A'}
        className={`outline-none ${place ? 'w-80' : 'w-32'} transform ease-in-out transition-all hover:w-80 bg-white pl-4 pr-4`}
        options={{ types: ['address'] }}
        onPlaceSelected={(place) => setPlace(place)}
      />
      <button className="w-12 h-12 bg-[#f9d0a0]" onClick={handleSubmit}>⮕</button>
    </div>
  );
};

export default Geocoder;
