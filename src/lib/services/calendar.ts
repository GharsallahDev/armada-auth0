import { getGoogleAccessToken, googleApi } from "./google-auth";

const CAL_BASE = "https://www.googleapis.com/calendar/v3";

async function getToken() {
  return getGoogleAccessToken();
}

export async function listEvents(userId: string, maxResults = 10) {
  const token = await getToken();
  const now = new Date().toISOString();
  const data = await googleApi(
    token,
    `${CAL_BASE}/calendars/primary/events?maxResults=${maxResults}&timeMin=${encodeURIComponent(now)}&orderBy=startTime&singleEvents=true`
  );

  return (data.items || []).map((event: {
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    location?: string;
    attendees?: { email: string; responseStatus?: string }[];
    status?: string;
  }) => ({
    id: event.id,
    title: event.summary || "No title",
    start: event.start?.dateTime || event.start?.date || "",
    end: event.end?.dateTime || event.end?.date || "",
    location: event.location || "",
    attendees: (event.attendees || []).map((a) => a.email).slice(0, 5),
    status: event.status,
  }));
}

export async function checkAvailability(userId: string, date: string) {
  const token = await getToken();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const data = await googleApi(
    token,
    `${CAL_BASE}/calendars/primary/events?timeMin=${encodeURIComponent(startOfDay.toISOString())}&timeMax=${encodeURIComponent(endOfDay.toISOString())}&orderBy=startTime&singleEvents=true`
  );

  const events = (data.items || []).map((e: { summary?: string; start?: { dateTime?: string }; end?: { dateTime?: string } }) => ({
    title: e.summary || "Busy",
    start: e.start?.dateTime || "",
    end: e.end?.dateTime || "",
  }));

  return {
    date,
    totalEvents: events.length,
    events,
    freeSlots: events.length === 0 ? "Entire day is free" : `${events.length} event(s) scheduled`,
  };
}

export async function createEvent(
  userId: string,
  summary: string,
  startTime: string,
  endTime: string,
  attendees?: string[],
  description?: string
) {
  const token = await getToken();

  const event: Record<string, unknown> = {
    summary,
    start: { dateTime: startTime, timeZone: "UTC" },
    end: { dateTime: endTime, timeZone: "UTC" },
  };
  if (description) event.description = description;
  if (attendees && attendees.length > 0) {
    event.attendees = attendees.map((email) => ({ email }));
  }

  const created = await googleApi(token, `${CAL_BASE}/calendars/primary/events`, {
    method: "POST",
    body: JSON.stringify(event),
  });

  return {
    id: created.id,
    title: created.summary,
    start: created.start?.dateTime || created.start?.date,
    end: created.end?.dateTime || created.end?.date,
    link: created.htmlLink,
    status: "created",
    hasExternalAttendees: (attendees || []).length > 0,
  };
}
