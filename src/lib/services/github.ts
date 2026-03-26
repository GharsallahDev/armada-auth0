import { getServiceToken } from "@/lib/token-vault";

async function getGithubToken(): Promise<string> {
  return getServiceToken("github");
}

async function githubApi(token: string, url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${error}`);
  }
  return res.json();
}

export async function listRepos(userId: string, limit = 10) {
  const token = await getGithubToken();
  const repos = await githubApi(token, `https://api.github.com/user/repos?per_page=${limit}&sort=updated`);
  return repos.map((r: any) => ({
    id: r.id,
    name: r.full_name,
    description: r.description || "",
    language: r.language || "Unknown",
    stars: r.stargazers_count,
    updatedAt: r.updated_at,
    url: r.html_url,
    isPrivate: r.private,
  }));
}

export async function listIssues(userId: string, repo: string, limit = 10) {
  const token = await getGithubToken();
  const issues = await githubApi(token, `https://api.github.com/repos/${repo}/issues?per_page=${limit}&state=open`);
  return issues.map((i: any) => ({
    id: i.id,
    number: i.number,
    title: i.title,
    state: i.state,
    author: i.user?.login || "unknown",
    labels: i.labels?.map((l: any) => l.name) || [],
    createdAt: i.created_at,
    url: i.html_url,
  }));
}

export async function readIssue(userId: string, repo: string, issueNumber: number) {
  const token = await getGithubToken();
  const issue = await githubApi(token, `https://api.github.com/repos/${repo}/issues/${issueNumber}`);
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: issue.body?.substring(0, 3000) || "",
    state: issue.state,
    author: issue.user?.login,
    labels: issue.labels?.map((l: any) => l.name) || [],
    assignees: issue.assignees?.map((a: any) => a.login) || [],
    createdAt: issue.created_at,
    comments: issue.comments,
    url: issue.html_url,
  };
}

export async function createIssue(userId: string, repo: string, title: string, body: string, labels?: string[]) {
  const token = await getGithubToken();
  const issue = await githubApi(token, `https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    body: JSON.stringify({ title, body, labels: labels || [] }),
  });
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    status: "created",
  };
}

export async function createComment(userId: string, repo: string, issueNumber: number, body: string) {
  const token = await getGithubToken();
  const comment = await githubApi(token, `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return {
    id: comment.id,
    url: comment.html_url,
    status: "created",
  };
}

export async function listPRs(userId: string, repo: string, limit = 10) {
  const token = await getGithubToken();
  const prs = await githubApi(token, `https://api.github.com/repos/${repo}/pulls?per_page=${limit}&state=open`);
  return prs.map((p: any) => ({
    id: p.id,
    number: p.number,
    title: p.title,
    state: p.state,
    author: p.user?.login,
    draft: p.draft,
    createdAt: p.created_at,
    url: p.html_url,
  }));
}
