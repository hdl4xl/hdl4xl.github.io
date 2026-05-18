const filterButtons = document.querySelectorAll("[data-filter]");
const noteItems = document.querySelectorAll(".note-list li");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    noteItems.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.tag === filter;
      item.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const calendarRoot = document.querySelector("[data-calendar]");

if (calendarRoot) {
  const storageKey = "personal-site-calendar-schedules";
  const defaultSchedules = {
    "2026-05-18": "整理个人网站第一版内容\n确定首页文案、栏目结构和第一批想公开保存的文字。",
    "2026-05-25": "发布第一篇个人感悟\n从最近最想表达的问题开始，先完成一篇短文。",
    "2026-06-01": "更新资料与阅读清单\n把常用链接、书单和学习资料按主题整理出来。",
  };

  const monthTitle = calendarRoot.querySelector("[data-calendar-month]");
  const calendarGrid = calendarRoot.querySelector("[data-calendar-grid]");
  const selectedDateTitle = calendarRoot.querySelector("[data-selected-date]");
  const scheduleInput = calendarRoot.querySelector("[data-schedule-input]");
  const saveButton = calendarRoot.querySelector("[data-save-schedule]");
  const clearButton = calendarRoot.querySelector("[data-clear-schedule]");
  const prevButton = calendarRoot.querySelector("[data-calendar-prev]");
  const nextButton = calendarRoot.querySelector("[data-calendar-next]");
  const todayButton = calendarRoot.querySelector("[data-calendar-today]");
  const saveStatus = calendarRoot.querySelector("[data-save-status]");

  const today = new Date();
  const todayKey = toDateKey(today);
  let selectedDateKey = todayKey;
  let activeMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let statusTimer;
  let schedules = loadSchedules();

  renderCalendar();
  updateEditor(false);

  prevButton.addEventListener("click", () => {
    activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  nextButton.addEventListener("click", () => {
    activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  todayButton.addEventListener("click", () => {
    selectedDateKey = todayKey;
    activeMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
    updateEditor(true);
  });

  saveButton.addEventListener("click", () => {
    const value = scheduleInput.value.trim();

    if (value) {
      schedules[selectedDateKey] = value;
    } else {
      delete schedules[selectedDateKey];
    }

    saveSchedules();
    renderCalendar();
    updateEditor(false);
    showStatus("已保存到日历。");
  });

  clearButton.addEventListener("click", () => {
    scheduleInput.value = "";
    delete schedules[selectedDateKey];
    saveSchedules();
    renderCalendar();
    updateEditor(true);
    showStatus("已清空当天日程。");
  });

  function loadSchedules() {
    const saved = readStorage();

    if (saved) {
      return saved;
    }

    writeStorage(defaultSchedules);
    return { ...defaultSchedules };
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeStorage(value) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      showStatus("浏览器未允许本地保存。");
    }
  }

  function saveSchedules() {
    writeStorage(schedules);
  }

  function renderCalendar() {
    calendarGrid.innerHTML = "";
    monthTitle.textContent = formatMonth(activeMonth);

    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let index = 0; index < firstWeekday; index += 1) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "calendar-empty";
      emptyCell.setAttribute("aria-hidden", "true");
      calendarGrid.append(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
      const dayButton = document.createElement("button");
      dayButton.className = "calendar-day";
      dayButton.type = "button";
      dayButton.dataset.date = dateKey;
      dayButton.setAttribute("aria-label", `${formatDateTitle(dateKey)}，点击编辑日程`);

      if (dateKey === todayKey) {
        dayButton.classList.add("is-today");
      }

      if (dateKey === selectedDateKey) {
        dayButton.classList.add("is-selected");
      }

      const dateNumber = document.createElement("span");
      dateNumber.className = "date-number";
      dateNumber.textContent = day;

      const agendaPreview = document.createElement("span");
      agendaPreview.className = "agenda-preview";
      appendAgendaPreview(agendaPreview, schedules[dateKey]);

      dayButton.append(dateNumber, agendaPreview);
      dayButton.addEventListener("click", () => {
        selectedDateKey = dateKey;
        renderCalendar();
        updateEditor(true);
      });

      calendarGrid.append(dayButton);
    }
  }

  function appendAgendaPreview(container, agendaText) {
    if (!agendaText || !agendaText.trim()) {
      return;
    }

    const lines = agendaText
      .split(/\n|；|;/)
      .map((line) => line.trim())
      .filter(Boolean);

    lines.forEach((line) => {
      const agendaLine = document.createElement("span");
      agendaLine.className = "agenda-line";
      agendaLine.textContent = line;
      container.append(agendaLine);
    });
  }

  function updateEditor(shouldFocus) {
    selectedDateTitle.textContent = formatDateTitle(selectedDateKey);
    scheduleInput.value = schedules[selectedDateKey] || "";

    if (shouldFocus) {
      scheduleInput.focus({ preventScroll: true });
    }
  }

  function showStatus(message) {
    saveStatus.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      saveStatus.textContent = "";
    }, 2200);
  }

  function formatMonth(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }

  function formatDateTitle(dateKey) {
    const [year, month, day] = dateKey.split("-");
    return `${year}年${Number(month)}月${Number(day)}日`;
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }
}
