import { app } from "./app.js";
import { hubspotAxios, sfrAxios } from "./configs/axiosConfigs.js";
import { logger } from "./utils/logger.js";

import { sfrcAnalyticsTohubspotSync } from "./controllers/sfrcAnalyticsTohubspotSync.js";
import { cleanProps, isValidEmail } from "./utils/cleanProps.js";
import {
  upsertCompanyInHubspotPayload,
  // getDateRange,
  setDateRange,
  getDailyDeltaRange,
  persistSuccessfulRun,
  getDeltaRange,
} from "./utils/helper.util.js";
import {
  getSavedListFromSFR,
  getBorrowersByList,
} from "./services/sfrService.js";

import {
  searchContactByEmail,
  searchContactByPhone,
  updateContact,
  createContact,
  upsertContactInhubspot,
  searchCompanyInHubspot,
  associateCompanyToContact,
  createCompanyInHubspot,
  updateCompanyInHubspot,
} from "./services/hubspotService.js";

export {
  app,
  hubspotAxios,
  logger,
  sfrAxios,
  upsertCompanyInHubspotPayload,
  isValidEmail,
  getSavedListFromSFR,
  getBorrowersByList,
  sfrcAnalyticsTohubspotSync,
  cleanProps,
  createContact,
  searchContactByEmail,
  upsertContactInhubspot,
  searchContactByPhone,
  updateContact,
  searchCompanyInHubspot,
  associateCompanyToContact,
  createCompanyInHubspot,
  updateCompanyInHubspot,
  // getDateRange,
  setDateRange,
  getDailyDeltaRange,
  persistSuccessfulRun,
  getDeltaRange,
};
