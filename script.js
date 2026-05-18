const panels = document.querySelectorAll("[data-panel]");
const navLinks = document.querySelectorAll(".nav-links a");
const validPanels = new Set([...panels].map((panel) => panel.id));

function activatePanel(panelId) {
  const nextPanel = validPanels.has(panelId) ? panelId : "welcome";

  navLinks.forEach((link) => {
    const linkPanel = link.getAttribute("href").replace("#", "");
    link.classList.toggle("is-active", linkPanel === nextPanel);
  });
}

window.addEventListener("hashchange", () => {
  activatePanel(window.location.hash.slice(1));
});

activatePanel(window.location.hash.slice(1));

const panelObserver = new IntersectionObserver(
  (entries) => {
    const visiblePanel = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visiblePanel) {
      activatePanel(visiblePanel.target.id);
    }
  },
  { threshold: [0.35, 0.6] },
);

panels.forEach((panel) => panelObserver.observe(panel));

const calendarRoot = document.querySelector("[data-calendar]");

if (calendarRoot) {
  const storageKey = "personal-site-calendar-schedules";
  const defaultSchedules = {
    "2026-05-18": "整理个人网站第一版内容\n确定首页文案、栏目结构和第一批想公开保存的文字。",
    "2026-05-25": "发布第一篇个人感悟\n从最近最想表达的问题开始，先完成一篇短文。",
    "2026-06-01": "更新资料与阅读清单\n把常用链接、书单和学习资料按主题整理出来。",
  };
  const firebaseVersion = "12.7.0";

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
  const syncStatus = calendarRoot.querySelector("[data-sync-status]");
  const syncLogin = calendarRoot.querySelector("[data-sync-login]");
  const syncLogout = calendarRoot.querySelector("[data-sync-logout]");
  const syncUserId = calendarRoot.querySelector("[data-sync-user-id]");

  const today = new Date();
  const todayKey = toDateKey(today);
  let selectedDateKey = todayKey;
  let activeMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let statusTimer;
  let schedules = loadLocalSchedules();
  let cloud = {
    auth: null,
    db: null,
    user: null,
    ready: false,
    configured: hasFirebaseConfig(),
    api: null,
  };

  renderCalendar();
  updateEditor(false);
  initCloudSync();

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

  saveButton.addEventListener("click", async () => {
    const value = scheduleInput.value.trim();

    if (value) {
      schedules[selectedDateKey] = value;
    } else {
      delete schedules[selectedDateKey];
    }

    saveLocalSchedules();
    renderCalendar();
    updateEditor(false);

    if (cloud.ready) {
      try {
        await saveCloudSchedule(selectedDateKey, value);
        showStatus("已保存并同步。");
      } catch (error) {
        showStatus("已本地保存，云端同步失败。");
        console.error(error);
      }
    } else {
      showStatus("已保存到当前浏览器。");
    }
  });

  clearButton.addEventListener("click", async () => {
    scheduleInput.value = "";
    delete schedules[selectedDateKey];
    saveLocalSchedules();
    renderCalendar();
    updateEditor(true);

    if (cloud.ready) {
      try {
        await saveCloudSchedule(selectedDateKey, "");
        showStatus("已清空并同步。");
      } catch (error) {
        showStatus("已本地清空，云端同步失败。");
        console.error(error);
      }
    } else {
      showStatus("已清空当天日程。");
    }
  });

  syncLogin.addEventListener("click", async () => {
    if (!cloud.configured) {
      showStatus("请先填写 Firebase 配置。");
      return;
    }

    try {
      await signInToCloud();
    } catch (error) {
      showStatus("登录失败，请检查 Firebase 配置。");
      console.error(error);
    }
  });

  syncLogout.addEventListener("click", async () => {
    if (!cloud.auth) {
      return;
    }

    await cloud.api.signOut(cloud.auth);
  });

  function loadLocalSchedules() {
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

  function saveLocalSchedules() {
    writeStorage(schedules);
  }

  async function initCloudSync() {
    if (!cloud.configured) {
      setSyncState("local");
      return;
    }

    try {
      const [{ initializeApp }, authApi, firestoreApi] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-firestore.js`),
      ]);

      const app = initializeApp(window.FIREBASE_CONFIG);
      cloud.auth = authApi.getAuth(app);
      cloud.db = firestoreApi.getFirestore(app);
      cloud.api = { ...authApi, ...firestoreApi };

      cloud.api.onAuthStateChanged(cloud.auth, async (user) => {
        cloud.user = user;
        cloud.ready = Boolean(user);

        if (!user) {
          setSyncState("signed-out");
          return;
        }

        setSyncState("loading");

        try {
          await loadCloudSchedules();
          setSyncState("synced");
        } catch (error) {
          setSyncState("error");
          console.error(error);
        }
      });
    } catch (error) {
      setSyncState("error");
      console.error(error);
    }
  }

  async function signInToCloud() {
    const provider = new cloud.api.GoogleAuthProvider();
    await cloud.api.signInWithPopup(cloud.auth, provider);
  }

  async function loadCloudSchedules() {
    const { collection, getDocs } = cloud.api;
    const snapshot = await getDocs(collection(cloud.db, "users", cloud.user.uid, "schedules"));
    const cloudSchedules = {};

    snapshot.forEach((document) => {
      const data = document.data();

      if (typeof data.text === "string" && data.text.trim()) {
        cloudSchedules[document.id] = data.text;
      }
    });

    schedules = { ...schedules, ...cloudSchedules };
    saveLocalSchedules();
    renderCalendar();
    updateEditor(false);
  }

  async function saveCloudSchedule(dateKey, text) {
    const { deleteDoc, doc, serverTimestamp, setDoc } = cloud.api;
    const documentRef = doc(cloud.db, "users", cloud.user.uid, "schedules", dateKey);

    if (!text) {
      await deleteDoc(documentRef);
      return;
    }

    await setDoc(documentRef, {
      text,
      date: dateKey,
      updatedAt: serverTimestamp(),
    });
  }

  function setSyncState(state) {
    syncLogin.hidden = true;
    syncLogout.hidden = true;
    syncUserId.hidden = true;
    syncUserId.textContent = "";

    if (state === "local") {
      syncStatus.textContent = "本地模式：待配置 Firebase";
      syncLogin.hidden = false;
      syncLogin.disabled = true;
      return;
    }

    syncLogin.disabled = false;

    if (state === "signed-out") {
      syncStatus.textContent = "云端未登录";
      syncLogin.hidden = false;
      return;
    }

    if (state === "loading") {
      syncStatus.textContent = "正在同步云端数据";
      syncLogout.hidden = false;
      return;
    }

    if (state === "synced") {
      syncStatus.textContent = `云端已同步：${cloud.user.email || "已登录"}`;
      syncLogout.hidden = false;
      syncUserId.hidden = false;
      syncUserId.textContent = `UID: ${cloud.user.uid}`;
      return;
    }

    syncStatus.textContent = "云端连接异常";
    syncLogin.hidden = false;
  }

  function hasFirebaseConfig() {
    const config = window.FIREBASE_CONFIG || {};
    return ["apiKey", "authDomain", "projectId", "appId"].every(
      (key) => typeof config[key] === "string" && config[key].trim(),
    );
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
