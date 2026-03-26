import { getGoogleAccessToken, googleApi } from "./google-auth";

const DRIVE_BASE = "https://www.googleapis.com/drive/v3";

async function getToken() {
  return getGoogleAccessToken();
}

export async function listFiles(userId: string, maxResults = 10, query?: string) {
  const token = await getToken();
  let q = "trashed=false";
  if (query) q += ` and name contains '${query.replace(/'/g, "\\'")}'`;

  const data = await googleApi(
    token,
    `${DRIVE_BASE}/files?pageSize=${maxResults}&q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`
  );

  return (data.files || []).map((f: {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime?: string;
    size?: string;
    webViewLink?: string;
  }) => ({
    id: f.id,
    name: f.name,
    type: friendlyType(f.mimeType),
    modified: f.modifiedTime || "",
    size: f.size ? formatSize(Number(f.size)) : "—",
    link: f.webViewLink || "",
  }));
}

export async function readDocument(userId: string, fileId: string) {
  const token = await getToken();
  // Get file metadata
  const meta = await googleApi(
    token,
    `${DRIVE_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime`
  );

  // Export Google Docs as plain text, download other files
  let content = "";
  if (meta.mimeType === "application/vnd.google-apps.document") {
    const res = await fetch(
      `${DRIVE_BASE}/files/${fileId}/export?mimeType=text/plain`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    content = (await res.text()).substring(0, 5000);
  } else if (meta.mimeType === "application/vnd.google-apps.spreadsheet") {
    const res = await fetch(
      `${DRIVE_BASE}/files/${fileId}/export?mimeType=text/csv`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    content = (await res.text()).substring(0, 5000);
  } else {
    content = `[Binary file: ${meta.name} (${meta.mimeType})]`;
  }

  return {
    id: meta.id,
    name: meta.name,
    type: friendlyType(meta.mimeType),
    modified: meta.modifiedTime,
    content,
  };
}

export async function createDocument(
  userId: string,
  title: string,
  content: string
) {
  const token = await getToken();

  // Create Google Doc
  const fileMeta = await googleApi(token, `${DRIVE_BASE}/files`, {
    method: "POST",
    body: JSON.stringify({
      name: title,
      mimeType: "application/vnd.google-apps.document",
    }),
  });

  // Update content via Google Docs API
  await fetch(
    `https://docs.googleapis.com/v1/documents/${fileMeta.id}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      }),
    }
  );

  return {
    id: fileMeta.id,
    title,
    link: `https://docs.google.com/document/d/${fileMeta.id}/edit`,
    status: "created",
  };
}

export async function shareDocument(
  userId: string,
  fileId: string,
  email: string,
  role: "reader" | "writer" = "reader"
) {
  const token = await getToken();
  await googleApi(token, `${DRIVE_BASE}/files/${fileId}/permissions`, {
    method: "POST",
    body: JSON.stringify({
      type: "user",
      role,
      emailAddress: email,
    }),
  });

  const meta = await googleApi(
    token,
    `${DRIVE_BASE}/files/${fileId}?fields=name,webViewLink`
  );

  return {
    fileId,
    fileName: meta.name,
    sharedWith: email,
    role,
    link: meta.webViewLink,
    status: "shared",
  };
}

function friendlyType(mimeType: string): string {
  const map: Record<string, string> = {
    "application/vnd.google-apps.document": "Google Doc",
    "application/vnd.google-apps.spreadsheet": "Google Sheet",
    "application/vnd.google-apps.presentation": "Google Slides",
    "application/vnd.google-apps.folder": "Folder",
    "application/pdf": "PDF",
    "image/png": "PNG Image",
    "image/jpeg": "JPEG Image",
  };
  return map[mimeType] || mimeType.split("/").pop() || "File";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
