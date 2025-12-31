import { hubspotAxios, cleanProps, logger, isValidEmail } from "../index.js";

async function upsertContactInhubspot(customer) {
  try {
    const rawProps = {
      company: customer.borrower_name,
      state: customer.state,
      firstname: customer.owner_first_name,
      lastname: customer.owner_last_name,
      phone: customer.first_phone,
      verified_phone: customer.verified_phone,
      second_phone: customer.second_phone,
      email: customer.first_email,
      number_of_loans: customer.num_loans,
      lenders: customer.lenders_used,
      msas: customer.msas,
      states_covered: customer.states_covered,
      last_purchase_date: customer.most_recent_recording_date,
      average_loan_size: customer.median_origination_amount,
      exits: customer.num_exits,
      next_due_date: customer.next_due_date,
      last_lender: customer.last_lender,
      last_property_address: customer.last_street_address,
      lastpropertycity: customer.last_city,
      last_property_state: customer.last_state,
      last_property_zip: customer.last_zip,
      last_property_msa: customer.last_msa,
      last_loan_amount____: customer.last_loan_amount,
      last_recording_date: customer.last_recording_date,
    };

    const payload = { properties: cleanProps(rawProps) };

    logger.info(`payload : ${JSON.stringify(payload)}`);

    let exists = [];

    // 1️⃣ Search by email
    if (isValidEmail(customer.first_email)) {
      logger.info(`Search by email: ${customer.first_email}`);
      exists = (await searchContactByEmail(customer.first_email)) || [];

      if (exists.length === 1) {
        logger.info(`Contact found: ${exists[0].id}`);
        const res = await updateContact(exists[0].id, payload);
        return res;
      }
    }

    if (customer.first_phone) {
      // 2️⃣ Search by phone
      logger.info(`Search by phone: ${customer.first_phone}`);
      exists = (await searchContactByPhone(customer.first_phone)) || [];
    }

    if (exists.length === 1) {
      logger.info(`Contact found: ${exists[0].id}`);
      const res = await updateContact(exists[0].id, payload);
      return res;
    }

    // 3️⃣ Create if email or phone exists
    if (customer.first_email || customer.first_phone) {
      logger.info(`Create if email or phone exists`);
      const res = await createContact(payload);
      return res;
    }
  } catch (error) {
    // logger.error("Error in upsertContactInHubspot:", error);
    logger.error("❌ Error updating/creating contact:");

    if (error.response) {
      logger.error("Status:", error.response.status);
      logger.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      logger.error(error.message);
    }

    return null;
  }
}

async function searchContactByEmail(email) {
  try {
    const response = await hubspotAxios.post("crm/v3/objects/contacts/search", {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname", "phone"], // return any fields you want
      limit: 100,
    });

    return response?.data?.results || [];
  } catch (error) {
    console.error(
      "Error searching contact by email:",
      error.response?.data || error
    );

    if (error.response) {
      logger.error("Status:", error.response.status);
      logger.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      logger.error(error.message);
    }
    return null;
  }
}
async function searchContactByPhone(phone) {
  try {
    const response = await hubspotAxios.post("crm/v3/objects/contacts/search", {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "phone",
              operator: "EQ",
              value: phone,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname", "phone"],
      limit: 1,
    });

    return response?.data?.results || [];
  } catch (error) {
    console.error(
      "Error searching contact by phone:",
      error.response?.data || error
    );

    if (error.response) {
      logger.error("Status:", error.response.status);
      logger.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      logger.error(error.message);
    }
    return null;
  }
}

async function updateContact(contactId, properties) {
  try {
    if (!contactId || !properties) {
      logger.warn("No contactId or properties found");
      return;
    }
    const response = await hubspotAxios.patch(
      `crm/v3/objects/contacts/${contactId}`,
      properties
    );

    logger.info(`✅ Contact updated: ${response.data.id}`);

    return response.data;
  } catch (error) {
    console.error("Error updating contact:", error.response?.data || error);
    return null;
  }
}

async function createContact(payload) {
  try {
    if (!payload) {
      logger.warn("No payload found");
      return;
    }

    const create_contact = await hubspotAxios.post(
      "crm/v3/objects/contacts",
      payload
    );

    logger.info(`✅ Contact created: ${create_contact.data.id}`);

    return create_contact.data;
  } catch (error) {
    logger.error("❌ Error creating contact");

    if (error.response) {
      logger.error(`Status: ${error.response.status}`);
      logger.error(
        `HubSpot Error Response: ${JSON.stringify(
          error.response.data,
          null,
          2
        )}`
      );
    } else {
      logger.error("Message:", error.message);
    }

    return null;
  }
}

// ----------------------------
// SEARCH COMPANY BY NAME
// ----------------------------
async function searchCompanyInHubspot(companyName) {
  if (!companyName) {
    logger.warn(" company name field is empty");
    return {};
  }
  try {
    const response = await hubspotAxios.post(
      "/crm/v3/objects/companies/search",
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "name",
                operator: "EQ",
                value: companyName,
              },
            ],
          },
        ],
        properties: ["name", "hs_object_id"],
        limit: 1,
      }
    );

    logger
      .info
      // `✅ Company found: ${JSON.stringify(response.data?.results[0])}`
      ();

    return response.data?.results[0] || null;
  } catch (error) {
    logger.error(
      `❌ Error in searchCompanyInHubspot(${companyName}): ${JSON.stringify(
        error.response?.data || error.message
      )}`
    );
    return null;
  }
}

// ----------------------------
// ASSOCIATE COMPANY → CONTACT
// ----------------------------
async function associateCompanyToContact(companyId, contactId) {
  try {
    const res = await hubspotAxios.post(
      "crm/v3/associations/companies/contacts/batch/create",
      {
        inputs: [
          {
            from: { id: companyId },
            to: { id: contactId },
            type: "company_to_contact",
          },
        ],
      }
    );

    logger.info(`✅ Associated contact ${contactId} → company ${companyId}`);
    // logger.info(`Association Response: ${JSON.stringify(res.data)}`);

    return res.data;
  } catch (err) {
    logger.error(
      `❌ Error associating company ${companyId} to contact ${contactId}: ${JSON.stringify(
        err.response?.data || err.message
      )}`
    );
    return null;
  }
}

async function createCompanyInHubspot(payload) {
  if (!payload) {
    logger.warn("payload is empty");
    return {};
  }
  try {
    // create company in hubspot
    // create payload
    //  call hubspot api to create company

    const response = await hubspotAxios.post(
      "/crm/v3/objects/companies",
      payload
    );

    // logger.info(`✅ Company created: ${JSON.stringify(response.data)}`);

    return response.data || {};
  } catch (error) {
    logger.error("Error in createCompanyInHubspot:", error);
    return {};
  }
}
async function updateCompanyInHubspot(payload, companyId) {
  if (!payload || companyId) {
    logger.warn("payload or companyId is empty");
    return {};
  }
  try {
    // update company in hubspot
    // create payload
    //  call hubspot api to update company

    const response = await hubspotAxios.patch(
      `/crm/v3/objects/companies/${companyId}`,
      payload
    );

    logger.info(`✅ Company updated: ${JSON.stingify(response.data)}`);
    return response.data || {};
  } catch (error) {
    logger.error("Error in updateCompanyInHubspot:", error);
    return {};
  }
}

export {
  searchContactByEmail,
  upsertContactInhubspot,
  searchContactByPhone,
  updateContact,
  createContact,
  searchCompanyInHubspot,
  associateCompanyToContact,
  createCompanyInHubspot,
  updateCompanyInHubspot,
};
