import { ref, reactive } from "vue";
import { reminders } from "../../../utils/systemUrls.js";
import { notify } from "notiwind";
import api from "../../../utils/api.js";

export const reminderList = reactive({
  active: {
    reminders: [],
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
      pageSize: 10,
    },
    loaded: false,
    loading: false,
  },
  completed: {
    reminders: [],
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
      pageSize: 10,
    },
    loaded: false,
    loading: false,
  },
});

const updateReminderList = (reminder, isEdit, statusList) => {
  if (isEdit) {
    const i = reminderList[statusList].reminders.findIndex(
      (p) => p.id === reminder.id,
    );
    if (i !== -1) reminderList[statusList].reminders[i] = { ...reminder };
  } else {
    reminderList[statusList].reminders.unshift({
      ...reminder,
      id: reminder.id,
    });
    if (
      reminderList[statusList].reminders.length >
      reminderList[statusList].pagination.pageSize
    ) {
      reminderList[statusList].reminders.pop();
    }
    reminderList[statusList].pagination.count += 1;
  }
};

export const mountUrl = (baseUrl, page, status) => {
  const params = new URLSearchParams();
  const url = baseUrl;
  params.set("page", page || 1);
  params.set("status", status);
  return `${url}?${params.toString()}`;
};

export const getReminders = async (page = 2, status) => {
  try {
    const { data } = await api.get(mountUrl(reminders, page, status));
    return data;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return { results: [], count: 0 };
  }
};

export const fetchRemindersFor = async (key, page) => {
  const isActive = key === "next";
  const bucket = isActive ? reminderList.active : reminderList.completed;
  bucket.loading = true;
  try {
    const data = await getReminders(page, isActive);
    bucket.reminders = data.results || [];
    bucket.pagination.count = data.count || 0;
    bucket.pagination.next = data.next || null;
    bucket.pagination.previous = data.previous || null;
    bucket.pagination.currentPage = page;
    bucket.loaded = true;
  } catch (error) {
    console.error("Error fetching reminders:", error);
  } finally {
    bucket.loading = false;
  }
};

export const saveReminder = async (payload) => {
  const isEdit = !!payload?.id;
  const params = payload?.params || {};
  const schedule = params?.schedule ? { ...params.schedule } : null;
  const message = params?.message ? { ...params.message } : null;

  if (!message[0]?.title) {
    throw new Error("O campo título é obrigatório.");
  }

  const config = isEdit
    ? {
        method: "patch",
        url: `${reminders}${payload.id}/`,
        success: "Produto editado com sucesso!",
      }
    : {
        method: "post",
        url: reminders,
        success: "Produto criado com sucesso!",
      };

  const requestBody = { schedule, message };

  try {
    const { data } = await api[config.method](config.url, requestBody);
    const successText =
      data?.message || config.success || "Lembrete salvo com sucesso.";
    notify({ group: "success", title: "Sucesso", text: successText }, 4000);

    updateReminderList(data.data, isEdit, "active");
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteReminder = async (id) => {
  try {
    const response = await api.delete(`${reminders}${id}/`);

    const index = reminderList.active.reminders.findIndex((p) => p.id === id);
    if (index !== -1) reminderList.active.reminders.splice(index, 1);

    notify(
      {
        group: "success",
        title: "Sucesso",
        text: response.data.message || "Lembrete deletado com sucesso.",
      },
      4000,
    );
    return response.data;
  } catch (error) {}
};

export const formatDateToSchedule = (date) => {
  if (!(date instanceof Date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatDateToHtml = (type, toFormart) => {
  if (type === "time") {
    return new Date(toFormart).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (type === "data") {
    return new Date(toFormart).toLocaleDateString("pt-BR");
  }
};

export const moveReminderToCompleted = (reminder) => {
  if (!reminder || !reminder.id) return;
  // Remove from active list if present
  const activeList = reminderList.active.reminders;
  const idx = activeList.findIndex((r) => r.id === reminder.id);
  if (idx !== -1) {
    activeList.splice(idx, 1);
    reminderList.active.pagination.count = Math.max(
      0,
      reminderList.active.pagination.count - 1,
    );
  }

  updateReminderList(reminder, false, "completed");
};
