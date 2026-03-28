import { getGoogleAccessToken, googleApi } from "./google-auth";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE_BASE = "https://www.googleapis.com/drive/v3";

async function getToken() {
  return getGoogleAccessToken();
}

export async function listSpreadsheets(userId: string, maxResults = 10) {
  const token = await getToken();
  const data = await googleApi(
    token,
    `${DRIVE_BASE}/files?q=${encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet'")}&pageSize=${maxResults}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,owners,webViewLink)`
  );

  return (data.files || []).map((file: {
    id: string;
    name: string;
    modifiedTime?: string;
    owners?: { displayName?: string; emailAddress?: string }[];
    webViewLink?: string;
  }) => ({
    id: file.id,
    name: file.name,
    modifiedTime: file.modifiedTime,
    owner: file.owners?.[0]?.displayName || file.owners?.[0]?.emailAddress || "",
    webViewLink: file.webViewLink,
  }));
}

export async function readSpreadsheet(userId: string, spreadsheetId: string, range?: string) {
  const token = await getToken();
  const rangeParam = range || "Sheet1!A1:Z50";

  const [meta, values] = await Promise.all([
    googleApi(token, `${SHEETS_BASE}/${spreadsheetId}?fields=properties.title,sheets.properties`),
    googleApi(token, `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(rangeParam)}`),
  ]);

  const rows = values.values || [];
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  return {
    title: meta.properties?.title || "Untitled",
    sheets: (meta.sheets || []).map((s: { properties?: { title?: string; sheetId?: number } }) => ({
      name: s.properties?.title,
      id: s.properties?.sheetId,
    })),
    range: rangeParam,
    headers,
    rows: dataRows.slice(0, 20),
    totalRows: dataRows.length,
  };
}

export async function createSpreadsheet(userId: string, title: string, headers?: string[], rows?: string[][]) {
  const token = await getToken();

  const body: Record<string, unknown> = {
    properties: { title },
  };

  const created = await googleApi(token, SHEETS_BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });

  // If headers/rows provided, write them
  if (headers || rows) {
    const values = [];
    if (headers) values.push(headers);
    if (rows) values.push(...rows);

    if (values.length > 0) {
      await googleApi(
        token,
        `${SHEETS_BASE}/${created.spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          body: JSON.stringify({ values }),
        }
      );
    }
  }

  return {
    id: created.spreadsheetId,
    title: created.properties?.title || title,
    url: created.spreadsheetUrl,
    status: "created",
    message: `Spreadsheet "${title}" created successfully`,
  };
}

export async function appendRows(userId: string, spreadsheetId: string, range: string, rows: string[][]) {
  const token = await getToken();

  const result = await googleApi(
    token,
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: rows }),
    }
  );

  return {
    spreadsheetId,
    updatedRange: result.updates?.updatedRange || range,
    updatedRows: result.updates?.updatedRows || rows.length,
    status: "appended",
    message: `Added ${rows.length} row(s) to spreadsheet`,
  };
}
