import { getGoogleAccessToken, googleApi } from "./google-auth";

const TASKS_BASE = "https://tasks.googleapis.com/tasks/v1";

async function getToken() {
  return getGoogleAccessToken();
}

export async function listTaskLists(userId: string) {
  const token = await getToken();
  const data = await googleApi(token, `${TASKS_BASE}/users/@me/lists`);

  return (data.items || []).map((list: {
    id: string;
    title: string;
    updated?: string;
  }) => ({
    id: list.id,
    title: list.title,
    updated: list.updated,
  }));
}

export async function listTasks(userId: string, taskListId?: string, maxResults = 20) {
  const token = await getToken();
  const listId = taskListId || "@default";

  const data = await googleApi(
    token,
    `${TASKS_BASE}/lists/${listId}/tasks?maxResults=${maxResults}&showCompleted=true&showHidden=false`
  );

  return (data.items || []).map((task: {
    id: string;
    title?: string;
    notes?: string;
    status?: string;
    due?: string;
    completed?: string;
    updated?: string;
    parent?: string;
    position?: string;
  }) => ({
    id: task.id,
    title: task.title || "Untitled",
    notes: task.notes || "",
    status: task.status || "needsAction",
    due: task.due || "",
    completed: task.completed || "",
    updated: task.updated || "",
  }));
}

export async function createTask(
  userId: string,
  title: string,
  notes?: string,
  due?: string,
  taskListId?: string
) {
  const token = await getToken();
  const listId = taskListId || "@default";

  const body: Record<string, unknown> = { title };
  if (notes) body.notes = notes;
  if (due) body.due = new Date(due).toISOString();

  const created = await googleApi(token, `${TASKS_BASE}/lists/${listId}/tasks`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    id: created.id,
    title: created.title,
    notes: created.notes || "",
    status: created.status,
    due: created.due || "",
    message: `Task "${title}" created successfully`,
  };
}

export async function completeTask(userId: string, taskId: string, taskListId?: string) {
  const token = await getToken();
  const listId = taskListId || "@default";

  const updated = await googleApi(
    token,
    `${TASKS_BASE}/lists/${listId}/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    }
  );

  return {
    id: updated.id,
    title: updated.title,
    status: "completed",
    completed: updated.completed,
    message: `Task "${updated.title}" marked as complete`,
  };
}
