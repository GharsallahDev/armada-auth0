import { getGoogleAccessToken, googleApi } from "./google-auth";

const PEOPLE_BASE = "https://people.googleapis.com/v1";

async function getToken() {
  return getGoogleAccessToken();
}

export async function listContacts(userId: string, maxResults = 20) {
  const token = await getToken();
  const data = await googleApi(
    token,
    `${PEOPLE_BASE}/people/me/connections?pageSize=${maxResults}&personFields=names,emailAddresses,phoneNumbers,organizations,photos&sortOrder=LAST_MODIFIED_DESCENDING`
  );

  return (data.connections || []).map((person: {
    resourceName?: string;
    names?: { displayName?: string }[];
    emailAddresses?: { value?: string; type?: string }[];
    phoneNumbers?: { value?: string; type?: string }[];
    organizations?: { name?: string; title?: string }[];
    photos?: { url?: string }[];
  }) => ({
    id: person.resourceName?.replace("people/", "") || "",
    name: person.names?.[0]?.displayName || "Unknown",
    email: person.emailAddresses?.[0]?.value || "",
    phone: person.phoneNumbers?.[0]?.value || "",
    organization: person.organizations?.[0]?.name || "",
    title: person.organizations?.[0]?.title || "",
    photo: person.photos?.[0]?.url || "",
  }));
}

export async function searchContacts(userId: string, query: string) {
  const token = await getToken();
  const data = await googleApi(
    token,
    `${PEOPLE_BASE}/people:searchContacts?query=${encodeURIComponent(query)}&readMask=names,emailAddresses,phoneNumbers,organizations,photos&pageSize=10`
  );

  return (data.results || []).map((result: {
    person?: {
      resourceName?: string;
      names?: { displayName?: string }[];
      emailAddresses?: { value?: string }[];
      phoneNumbers?: { value?: string }[];
      organizations?: { name?: string; title?: string }[];
      photos?: { url?: string }[];
    };
  }) => {
    const p = result.person;
    return {
      id: p?.resourceName?.replace("people/", "") || "",
      name: p?.names?.[0]?.displayName || "Unknown",
      email: p?.emailAddresses?.[0]?.value || "",
      phone: p?.phoneNumbers?.[0]?.value || "",
      organization: p?.organizations?.[0]?.name || "",
      title: p?.organizations?.[0]?.title || "",
      photo: p?.photos?.[0]?.url || "",
    };
  });
}

export async function getContact(userId: string, contactId: string) {
  const token = await getToken();
  const person = await googleApi(
    token,
    `${PEOPLE_BASE}/people/${contactId}?personFields=names,emailAddresses,phoneNumbers,organizations,photos,addresses,birthdays,biographies`
  );

  return {
    id: person.resourceName?.replace("people/", "") || contactId,
    name: person.names?.[0]?.displayName || "Unknown",
    emails: (person.emailAddresses || []).map((e: { value?: string; type?: string }) => ({
      email: e.value,
      type: e.type || "other",
    })),
    phones: (person.phoneNumbers || []).map((p: { value?: string; type?: string }) => ({
      number: p.value,
      type: p.type || "other",
    })),
    organization: person.organizations?.[0]?.name || "",
    title: person.organizations?.[0]?.title || "",
    photo: person.photos?.[0]?.url || "",
    address: person.addresses?.[0]?.formattedValue || "",
    birthday: person.birthdays?.[0]?.date
      ? `${person.birthdays[0].date.month}/${person.birthdays[0].date.day}`
      : "",
    bio: person.biographies?.[0]?.value || "",
  };
}
