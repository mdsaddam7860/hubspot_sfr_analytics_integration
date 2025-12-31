import axios from "axios";

const hubspotAxios = axios.create({
  baseURL: process.env.HUBSPOT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
  },
});

const sfrAxios = axios.create({
  //
  baseURL: process.env.SFR_BASE_URL,
  headers: {
    "X-API-Key": process.env.SFR_API_KEY,
    "Content-Type": "application/json",
    Cookie: process.env.SFR_COOKIE,
  },
});

// const hubspotAssociations = axios.create({
//   baseURL: "https://api.hubapi.com/crm/v3/associations/",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${process.env.HUBSPOT_KEY}`,
//   },
// });

export { hubspotAxios, sfrAxios };
