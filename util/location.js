// const { default: axios } = require("axios");
// const HttpError = require("../models/http-error");

// const API_KEY = "AIzaSyDgLmMpKCzveJf1_yuA0fUzzhy0WRChvZA";

// async function getCoordsForAddress(address) {
//   const response = await axios.get(
//     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//       address
//     )}&key=${API_KEY}`
//   );
//   const data = response.data;
//   if (!data || data.status === "ZERO_RESULTS") {
//     throw new HttpError(
//       "Could not find location for the spcefied address.",
//       422
//     );
//   }
//   const corrdinates = data.results[0].geometry.location;
//   return corrdinates;
// }
const getCoordsForAddress = () => {
  return { lat: 21.28072235129267, lng: 73.08025617066227 };
};
module.exports = getCoordsForAddress;
