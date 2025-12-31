import {
  logger,
  sfrAxios,
  persistSuccessfulRun,
  getDeltaRange,
} from "../index.js";

async function getSavedListFromSFR() {
  try {
    const lists = await sfrAxios.get("/saved-lists/");

    return lists.data?.results || [];
  } catch (error) {
    logger.error(`Error fetching saved list from SFR:`, error);
    return [];
  }
}

const listId = process.env.SFR_LISTID; // grab it once

async function getBorrowersByList() {
  try {
    if (!listId) throw new Error("listId is required in .env as SFR_LISTID");

    const { start_date, end_date } = getDeltaRange();
    logger.info(
      `Fetching borrowers from SFR from ${start_date} to ${end_date}`
    );

    let page = 1;
    let lists = [];

    // First request to get total count
    const firstRes = await sfrAxios.get(
      `/saved-lists/${listId}/content?start_date=${start_date}&end_date=${end_date}&page=${page}&page_size=1000`
    );

    const { count, page_size, results } = firstRes.data;
    lists.push(...results);

    const totalPages = Math.ceil(count / page_size);
    logger.info(`📄 Total pages: ${totalPages}, Total count: ${count}`);

    // Fetch remaining pages
    for (page = 2; page <= totalPages; page++) {
      const res = await sfrAxios.get(
        `/saved-lists/${listId}/content?start_date=${start_date}&end_date=${end_date}&page=${page}&page_size=1000`
      );

      if (res.data.results && Array.isArray(res.data.results)) {
        lists.push(...res.data.results);

        logger.info(`✅ Page ${page} fetched (${lists.length} total)`);
      } else {
        logger.warn(`⚠️ Page ${page} returned no results`);
      }
    }

    logger.info(`🎯 Done fetching all borrowers. Total: ${lists.length}`);
    persistSuccessfulRun(end_date); // Keep last successful end date

    return lists;
  } catch (error) {
    logger.error(`❌ Error fetching borrowers from SFR: ${error.message}`);
    return [];
  }
}
export { getSavedListFromSFR, getBorrowersByList };
