import {
  app,
  logger,
  getSavedListFromSFR,
  getBorrowersByList,
  upsertContactInhubspot,
  searchCompanyInHubspot,
  associateCompanyToContact,
  createCompanyInHubspot,
  updateCompanyInHubspot,
  upsertCompanyInHubspotPayload,
} from "../index.js";

async function sfrcAnalyticsTohubspotSync() {
  try {
    // const lists = await getSavedListFromSFR();
    // logger.info(`getSavedListFromSFR : ${lists.length} lists fetched`);
    const borrowers = await getBorrowersByList();
    logger.info(`getBorrowersByList : ${borrowers.length} lists fetched`);
    logger.info(`Borrowers : ${JSON.stringify(borrowers[0], null, 2)}`);

    // logger.info(`Syncing to hubspot...`);

    for (const borrower of borrowers) {
      try {
        // upsert contact in hubspot

        // logger.info(`borrowers : ${JSON.stringify(borrower)}`);
        const contact = await upsertContactInhubspot(borrower);

        // search company in hubspot if does not exists create it and associate to contact, else associate to contact

        let company = await searchCompanyInHubspot(borrower.borrower_name);

        const payload = upsertCompanyInHubspotPayload(borrower);
        if (!company) {
          // create company in hubspot
          company = await createCompanyInHubspot(payload);
        }
        if (company.id && contact.id) {
          // Associate company and contact in hubspot
          const associate = await associateCompanyToContact(
            company.id,
            contact.id
          );
        }

        // logger.info(`✅ Contact updated/created: ${JSON.stringify(contact)}`);
      } catch (error) {
        logger.error(`Error In Syncing SFRC Analytics To Hubspot:`, error);
        return;
      }
    }
  } catch (error) {
    logger.error(`Error In Syncing SFR Analytics To Hubspot:`, error);
  }
}

export { sfrcAnalyticsTohubspotSync };
