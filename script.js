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
  const siteContentKey = "personal-site-content";
  const legacyPlanKey = "personal-site-monthly-plans";
  const defaultSchedules = {
    "2026-05-18": "整理个人网站第一版内容\n确定首页文案、栏目结构和第一批想公开保存的文字。",
    "2026-05-25": "发布第一篇个人感悟\n从最近最想表达的问题开始，先完成一篇短文。",
    "2026-06-01": "更新资料与阅读清单\n把常用链接、书单和学习资料按主题整理出来。",
  };
  const defaultSiteContent = {
    brand: "洪都拉斯雪莉 LAB",
    nav: {
      scheduleLabel: "日程安排",
      scheduleSub: "SCHEDULE",
      ideasLabel: "构思",
      ideasSub: "IDEAS",
      resourcesLabel: "资料存放",
      resourcesSub: "RESOURCES",
    },
    home: {
      eyebrow: "SHERRY LAB / HOME",
      title: "Welcome To My Space",
      description: "",
      cta: "ENTER",
    },
    schedule: {
      eyebrow: "A.01 / SCHEDULE",
      title: "日程安排",
      description: "点击日历中的某一天，编辑并保存当天要做的事情。",
    },
    ideas: {
      eyebrow: "B.02 / IDEAS",
      title: "构思",
      description: "把尚未成文的想法先保存下来，之后再慢慢展开。",
      items: [
        {
          label: "IDEA 01",
          title: "如何把零散想法整理成文章",
          text: "先保留问题，再补充观察，最后形成自己的判断。",
          blocks: [{ id: "idea-01-block-01", text: "先保留问题，再补充观察，最后形成自己的判断。" }],
        },
        {
          label: "IDEA 02",
          title: "关于长期主义的真实感受",
          text: "长期不是慢，而是知道哪些事情值得反复投入。",
          blocks: [{ id: "idea-02-block-01", text: "长期不是慢，而是知道哪些事情值得反复投入。" }],
        },
        {
          label: "IDEA 03",
          title: "建立个人知识系统",
          text: "资料不是越多越好，关键是能被再次找到和重新使用。",
          blocks: [{ id: "idea-03-block-01", text: "资料不是越多越好，关键是能被再次找到和重新使用。" }],
        },
      ],
    },
    resources: {
      eyebrow: "C.03 / RESOURCES",
      title: "资料存放",
      description: "整理公开资料、参考链接、阅读清单和后续写作素材。",
      items: [
        {
          label: "READING",
          title: "阅读清单与书摘整理",
          url: "#",
        },
        {
          label: "LINKS",
          title: "常用网站、工具与参考链接",
          url: "#",
        },
        {
          label: "NOTES",
          title: "学习资料、课程笔记和阶段总结",
          url: "#",
        },
        {
          label: "ARCHIVE",
          title: "旧文章、旧想法和待整理素材",
          url: "#",
        },
      ],
    },
    monthlyPlans: {},
    yearlyPlans: {},
  };
  const firebaseVersion = "12.7.0";
  const colorPalette = ["#ef4cac", "#42d6ff", "#ffb84d", "#7cf58b", "#b48cff", "#ff6f7d", "#4df0c8"];

  const ideaGrid = document.querySelector("[data-idea-grid]");
  const resourceList = document.querySelector("[data-resource-list]");
  const siteEditor = document.querySelector("[data-site-editor]");
  const siteEditorOpen = document.querySelector("[data-site-editor-open]");
  const siteEditorClose = document.querySelector("[data-site-editor-close]");
  const siteEditorForm = document.querySelector("[data-site-editor-form]");
  const siteEditorFields = document.querySelector("[data-site-editor-fields]");
  const siteEditorStatus = document.querySelector("[data-site-editor-status]");
  const editorSyncState = document.querySelector("[data-editor-sync-state]");
  const cloudRefresh = document.querySelector("[data-cloud-refresh]");
  const ideaAdd = document.querySelector("[data-idea-add]");
  const ideaSave = document.querySelector("[data-idea-save]");
  const ideaStatus = document.querySelector("[data-idea-status]");
  const resourceAdd = document.querySelector("[data-resource-add]");
  const resourceSave = document.querySelector("[data-resource-save]");
  const resourceStatus = document.querySelector("[data-resource-status]");
  const scheduleTabs = document.querySelectorAll("[data-schedule-view]");
  const schedulePanels = calendarRoot.querySelectorAll("[data-schedule-panel]");
  const monthTitle = calendarRoot.querySelector("[data-calendar-month]");
  const calendarGrid = calendarRoot.querySelector("[data-calendar-grid]");
  const selectedDateTitle = calendarRoot.querySelector("[data-selected-date]");
  const scheduleItemsRoot = calendarRoot.querySelector("[data-schedule-items]");
  const addScheduleItem = calendarRoot.querySelector("[data-add-schedule-item]");
  const saveButton = calendarRoot.querySelector("[data-save-schedule]");
  const clearButton = calendarRoot.querySelector("[data-clear-schedule]");
  const prevButton = calendarRoot.querySelector("[data-calendar-prev]");
  const nextButton = calendarRoot.querySelector("[data-calendar-next]");
  const todayButton = calendarRoot.querySelector("[data-calendar-today]");
  const saveStatus = calendarRoot.querySelector("[data-save-status]");
  const syncStatus = document.querySelector("[data-sync-status]");
  const syncLogin = document.querySelector("[data-sync-login]");
  const syncLoginLabel = document.querySelector("[data-sync-login-label]");
  const syncUserId = document.querySelector("[data-sync-user-id]");
  const planMonthTitle = calendarRoot.querySelector("[data-plan-month]");
  const ganttScale = calendarRoot.querySelector("[data-gantt-scale]");
  const ganttRows = calendarRoot.querySelector("[data-gantt-rows]");
  const planPrev = calendarRoot.querySelector("[data-plan-prev]");
  const planCurrent = calendarRoot.querySelector("[data-plan-current]");
  const planNext = calendarRoot.querySelector("[data-plan-next]");
  const planAdd = calendarRoot.querySelector("[data-plan-add]");
  const planSave = calendarRoot.querySelector("[data-plan-save]");
  const yearPlanTitle = calendarRoot.querySelector("[data-year-plan-title]");
  const yearRows = calendarRoot.querySelector("[data-year-rows]");
  const yearPrev = calendarRoot.querySelector("[data-year-prev]");
  const yearCurrent = calendarRoot.querySelector("[data-year-current]");
  const yearNext = calendarRoot.querySelector("[data-year-next]");
  const yearAdd = calendarRoot.querySelector("[data-year-add]");
  const yearSave = calendarRoot.querySelector("[data-year-save]");

  const today = new Date();
  const todayKey = toDateKey(today);
  let selectedDateKey = todayKey;
  let activeMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let activePlanMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let activeYear = today.getFullYear();
  let statusTimer;
  let editorStatusTimer;
  let ideaStatusTimer;
  let resourceStatusTimer;
  let quickSaveTimer;
  let siteContent = loadSiteContent();
  let schedules = loadLocalSchedules();
  let monthlyPlans = loadMonthlyPlans();
  let yearlyPlans = loadYearlyPlans();
  let cloud = {
    db: null,
    ready: false,
    configured: hasFirebaseConfig(),
    api: null,
    siteContentError: null,
    lastError: null,
    unsubscribeSchedules: null,
  };

  applySiteContent();
  renderSiteEditor();
  renderCalendar();
  renderMonthlyPlan();
  renderYearlyPlan();
  updateEditor(false);
  setScheduleView("day");
  initCloudSync();

  scheduleTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setScheduleView(tab.dataset.scheduleView);
    });
  });

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

  planPrev.addEventListener("click", () => {
    syncCurrentMonthPlan();
    saveMonthlyPlans();
    activePlanMonth = new Date(activePlanMonth.getFullYear(), activePlanMonth.getMonth() - 1, 1);
    renderMonthlyPlan();
  });

  planCurrent.addEventListener("click", () => {
    syncCurrentMonthPlan();
    saveMonthlyPlans();
    activePlanMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderMonthlyPlan();
  });

  planNext.addEventListener("click", () => {
    syncCurrentMonthPlan();
    saveMonthlyPlans();
    activePlanMonth = new Date(activePlanMonth.getFullYear(), activePlanMonth.getMonth() + 1, 1);
    renderMonthlyPlan();
  });

  planAdd.addEventListener("click", () => {
    syncCurrentMonthPlan();
    const key = toMonthKey(activePlanMonth);
    const start = 1;
    const end = Math.min(7, getDaysInMonth(activePlanMonth));
    const monthPlan = ensureMonthPlan(key, getDaysInMonth(activePlanMonth));

    monthPlan.tasks.push({
      id: createPlanId(),
      title: "新的月度计划",
      start,
      end,
      progress: 0,
    });
    saveMonthlyPlans();
    renderMonthlyPlan();
  });

  planSave.addEventListener("click", async () => {
    syncCurrentMonthPlan();
    saveMonthlyPlans();
    renderMonthlyPlan();

    if (cloud.ready) {
      try {
        await saveCloudSiteContent();
        showStatus("月度计划已保存并同步。");
      } catch (error) {
        showStatus("月度计划已本地保存，云端同步失败。");
        console.error(error);
      }
    } else {
      showStatus(localOnlyMessage("月度计划已保存"));
    }
  });

  yearPrev.addEventListener("click", () => {
    syncCurrentYearPlan();
    saveYearlyPlans();
    activeYear -= 1;
    renderYearlyPlan();
  });

  yearCurrent.addEventListener("click", () => {
    syncCurrentYearPlan();
    saveYearlyPlans();
    activeYear = today.getFullYear();
    renderYearlyPlan();
  });

  yearNext.addEventListener("click", () => {
    syncCurrentYearPlan();
    saveYearlyPlans();
    activeYear += 1;
    renderYearlyPlan();
  });

  yearAdd.addEventListener("click", () => {
    syncCurrentYearPlan();
    const yearPlan = ensureYearPlan(activeYear);

    yearPlan.tasks.push({
      id: createPlanId(),
      title: "新的年度计划",
      start: 1,
      end: 3,
    });
    saveYearlyPlans();
    renderYearlyPlan();
  });

  yearSave.addEventListener("click", async () => {
    syncCurrentYearPlan();
    saveYearlyPlans();
    renderYearlyPlan();

    if (cloud.ready) {
      try {
        await saveCloudSiteContent();
        showStatus("年度计划已保存并同步。");
      } catch (error) {
        showStatus("年度计划已本地保存，云端同步失败。");
        console.error(error);
      }
    } else {
      showStatus(localOnlyMessage("年度计划已保存"));
    }
  });

  addScheduleItem.addEventListener("click", () => {
    const items = collectScheduleItems({ keepEmpty: true });
    items.push({
      id: createPlanId(),
      text: "",
    });
    renderScheduleItems(items, true);
  });

  saveButton.addEventListener("click", async () => {
    const items = collectScheduleItems();

    if (items.length) {
      schedules[selectedDateKey] = items;
    } else {
      delete schedules[selectedDateKey];
    }

    saveLocalSchedules();
    renderCalendar();
    updateEditor(false);

    if (cloud.ready) {
      try {
        await saveCloudSchedule(selectedDateKey, items);
        showStatus("已保存并同步。");
      } catch (error) {
        showStatus("已本地保存，云端同步失败。");
        console.error(error);
      }
    } else {
      showStatus(localOnlyMessage("已保存"));
    }
  });

  clearButton.addEventListener("click", async () => {
    delete schedules[selectedDateKey];
    renderScheduleItems([], false);
    saveLocalSchedules();
    renderCalendar();
    updateEditor(true);

    if (cloud.ready) {
      try {
        await saveCloudSchedule(selectedDateKey, []);
        showStatus("已清空并同步。");
      } catch (error) {
        showStatus("已本地清空，云端同步失败。");
        console.error(error);
      }
    } else {
      showStatus("已清空当天日程。");
    }
  });

  scheduleItemsRoot.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-schedule-delete]");

    if (!deleteButton) {
      return;
    }

    deleteButton.closest("[data-schedule-item]").remove();
    const items = collectScheduleItems();

    if (items.length) {
      schedules[selectedDateKey] = items;
    } else {
      delete schedules[selectedDateKey];
    }

    saveLocalSchedules();
    renderCalendar();

    if (cloud.ready) {
      try {
        await saveCloudSchedule(selectedDateKey, items);
        showStatus("已删除该条计划并同步。");
      } catch (error) {
        showStatus("已本地删除，云端同步失败。");
        console.error(error);
      }
    } else {
      showStatus("已删除该条计划。");
    }
  });

  syncLogin.addEventListener("click", async () => {
    if (!cloud.configured) {
      showGlobalStatus("请先填写 Firebase 配置。");
      return;
    }

    if (!cloud.ready) {
      showGlobalStatus("公共云端还未连接，请稍后重试。");
      return;
    }

    try {
      await refreshCloudContent({ forceServer: true });
      showGlobalStatus("已刷新公共云端内容。");
    } catch (error) {
      showGlobalStatus(getCloudErrorMessage(error));
      console.error(error);
    }
  });

  ideaAdd.addEventListener("click", async () => {
    collectEditableSections();
    addEditorItem("ideas");
    applySiteContent();
    await persistSiteContent(ideaStatus, "已新增并同步构思。", "已新增构思。", "已新增构思，云端同步失败。");
  });

  ideaSave.addEventListener("click", async () => {
    collectEditableSections();
    applySiteContent();
    await persistSiteContent(ideaStatus, "构思已保存并同步。", "构思已保存到当前浏览器。", "构思已本地保存，云端同步失败。");
  });

  ideaGrid.addEventListener("click", async (event) => {
    const addBlockButton = event.target.closest("[data-idea-block-add]");
    const deleteBlockButton = event.target.closest("[data-idea-block-delete]");
    const deleteButton = event.target.closest("[data-idea-delete]");
    const moveButton = event.target.closest("[data-idea-move]");

    if (!deleteButton && !addBlockButton && !deleteBlockButton && !moveButton) {
      return;
    }

    collectEditableSections();

    if (moveButton) {
      const ideaItem = moveButton.closest("[data-idea-item]");
      const moved = moveEditorItem("ideas", Number(ideaItem?.dataset.ideaItem), Number(moveButton.dataset.ideaMove));

      if (!moved) {
        return;
      }

      applySiteContent();
      await persistSiteContent(ideaStatus, "构思顺序已同步。", "构思顺序已保存。", "构思顺序已本地保存，云端同步失败。");
      return;
    }

    if (addBlockButton) {
      const ideaIndex = Number(addBlockButton.dataset.ideaBlockAdd);
      const idea = siteContent.ideas.items[ideaIndex];

      if (idea) {
        idea.blocks.push({
          id: createPlanId(),
          text: "",
        });
      }

      applySiteContent();
      await persistSiteContent(ideaStatus, "构思块已新增并同步。", "构思块已新增。", "构思块已新增，云端同步失败。");
      return;
    }

    if (deleteBlockButton) {
      const ideaItem = deleteBlockButton.closest("[data-idea-item]");
      const ideaIndex = Number(ideaItem?.dataset.ideaItem);
      const blockIndex = Number(deleteBlockButton.dataset.ideaBlockDelete);
      const idea = siteContent.ideas.items[ideaIndex];

      if (idea && Number.isFinite(blockIndex)) {
        idea.blocks.splice(blockIndex, 1);
        idea.text = idea.blocks.map((block) => block.text).join("\n");
      }

      applySiteContent();
      await persistSiteContent(ideaStatus, "构思块已删除并同步。", "构思块已删除。", "构思块已删除，云端同步失败。");
      return;
    }

    removeEditorItem("ideas", Number(deleteButton.dataset.ideaDelete));
    applySiteContent();
    await persistSiteContent(ideaStatus, "构思已删除并同步。", "构思已删除。", "构思已删除，云端同步失败。");
  });

  ideaGrid.addEventListener("input", scheduleEditableLocalSave);

  resourceAdd.addEventListener("click", async () => {
    collectEditableSections();
    addEditorItem("resources");
    applySiteContent();
    await persistSiteContent(resourceStatus, "已新增并同步资料。", "已新增资料。", "已新增资料，云端同步失败。");
  });

  resourceSave.addEventListener("click", async () => {
    collectEditableSections();
    applySiteContent();
    await persistSiteContent(resourceStatus, "资料已保存并同步。", "资料已保存到当前浏览器。", "资料已本地保存，云端同步失败。");
  });

  resourceList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-resource-delete]");
    const moveButton = event.target.closest("[data-resource-move]");

    if (!deleteButton && !moveButton) {
      return;
    }

    collectEditableSections();

    if (moveButton) {
      const resourceItem = moveButton.closest("[data-resource-item]");
      const moved = moveEditorItem("resources", Number(resourceItem?.dataset.resourceItem), Number(moveButton.dataset.resourceMove));

      if (!moved) {
        return;
      }

      applySiteContent();
      await persistSiteContent(resourceStatus, "资料顺序已同步。", "资料顺序已保存。", "资料顺序已本地保存，云端同步失败。");
      return;
    }

    removeEditorItem("resources", Number(deleteButton.dataset.resourceDelete));
    applySiteContent();
    await persistSiteContent(resourceStatus, "资料已删除并同步。", "资料已删除。", "资料已删除，云端同步失败。");
  });

  resourceList.addEventListener("input", scheduleEditableLocalSave);

  if (siteEditorOpen) {
    siteEditorOpen.addEventListener("click", () => {
      renderSiteEditor();
      updateEditorSyncState();
      siteEditor.hidden = false;
    });
  }

  if (siteEditorClose) {
    siteEditorClose.addEventListener("click", () => {
      siteEditor.hidden = true;
    });
  }

  if (siteEditorForm) {
    siteEditorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      syncCurrentMonthPlan();
      saveMonthlyPlans();
      syncCurrentYearPlan();
      saveYearlyPlans();
      collectEditableSections();
      collectSiteEditorForm();
      applySiteContent();
      saveSiteContentLocal();
      renderSiteEditor();

      if (cloud.ready) {
        try {
          await saveCloudSiteContent();
          showEditorStatus("整站内容已保存并同步。");
        } catch (error) {
          showEditorStatus("已本地保存，云端同步失败。");
          console.error(error);
        }
      } else {
        showEditorStatus(localOnlyMessage("整站内容已保存"));
      }
    });
  }

  if (cloudRefresh) {
    cloudRefresh.addEventListener("click", async () => {
      if (!cloud.configured) {
        showEditorStatus("Firebase 未配置，无法刷新云端。");
        return;
      }

      try {
        await refreshCloudContent({ forceServer: true });
        showEditorStatus("已从云端刷新最新内容。");
      } catch (error) {
        cloud.lastError = error;
        showEditorStatus(getCloudErrorMessage(error));
        console.error(error);
      }
    });
  }

  if (siteEditorFields) {
    siteEditorFields.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-editor-add]");
      const removeButton = event.target.closest("[data-editor-remove]");

      if (!addButton && !removeButton) {
        return;
      }

      collectEditableSections();
      collectSiteEditorForm();

      if (addButton) {
        addEditorItem(addButton.dataset.editorAdd);
      }

      if (removeButton) {
        removeEditorItem(removeButton.dataset.editorRemove, Number(removeButton.dataset.editorIndex));
      }

      applySiteContent();
      renderSiteEditor();
    });
  }

  function loadSiteContent() {
    try {
      const raw = localStorage.getItem(siteContentKey);
      return mergeSiteContent(defaultSiteContent, raw ? JSON.parse(raw) : null);
    } catch {
      return mergeSiteContent(defaultSiteContent, null);
    }
  }

  function saveSiteContentLocal() {
    try {
      localStorage.setItem(siteContentKey, JSON.stringify(siteContent));
    } catch {
      showStatus("浏览器未允许保存整站内容。");
    }
  }

  function applySiteContent() {
    document.title = siteContent.brand || defaultSiteContent.brand;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", siteContent.home.description || defaultSiteContent.home.description);
    }

    document.querySelectorAll("[data-site-field]").forEach((element) => {
      const value = getPath(siteContent, element.dataset.siteField);

      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    renderIdeaCards();
    renderResourceItems();
  }

  function renderIdeaCards() {
    ideaGrid.innerHTML = "";

    siteContent.ideas.items.forEach((item, index) => {
      const article = document.createElement("article");
      const top = document.createElement("div");
      const label = document.createElement("input");
      const controls = document.createElement("div");
      const moveUp = createReorderButton(`上移构思 ${index + 1}`, -1, index === 0, "ideaMove");
      const moveDown = createReorderButton(`下移构思 ${index + 1}`, 1, index === siteContent.ideas.items.length - 1, "ideaMove");
      const remove = document.createElement("button");
      const title = document.createElement("input");
      const blockTools = document.createElement("div");
      const addBlock = document.createElement("button");
      const blocks = document.createElement("div");

      article.dataset.ideaItem = String(index);
      top.className = "editable-card-top";
      label.className = "editable-label";
      label.type = "text";
      label.value = item.label || `IDEA ${pad(index + 1)}`;
      label.setAttribute("aria-label", "构思编号");
      label.dataset.ideaField = "label";

      controls.className = "item-reorder";

      remove.className = "gantt-delete";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `删除构思 ${index + 1}`);
      remove.dataset.ideaDelete = String(index);

      title.className = "idea-title-input";
      title.type = "text";
      title.value = item.title || "";
      title.placeholder = "一句话标题";
      title.setAttribute("aria-label", "构思标题");
      title.dataset.ideaField = "title";

      blockTools.className = "idea-block-tools";
      addBlock.className = "ghost-button";
      addBlock.type = "button";
      addBlock.textContent = "新增块";
      addBlock.dataset.ideaBlockAdd = String(index);

      blocks.className = "idea-blocks";
      (item.blocks.length ? item.blocks : [{ id: createPlanId(), text: "" }]).forEach((block, blockIndex) => {
        blocks.append(createIdeaBlock(block, index, blockIndex));
      });

      controls.append(moveUp, moveDown, remove);
      top.append(label, controls);
      blockTools.append(addBlock);
      article.append(top, title, blockTools, blocks);
      ideaGrid.append(article);
    });
  }

  function createReorderButton(label, direction, disabled, datasetKey) {
    const button = document.createElement("button");

    button.className = "reorder-button";
    button.type = "button";
    button.textContent = direction < 0 ? "↑" : "↓";
    button.setAttribute("aria-label", label);
    button.disabled = disabled;
    button.dataset[datasetKey] = String(direction);

    return button;
  }

  function createIdeaBlock(block, ideaIndex, blockIndex) {
    const item = document.createElement("div");
    const textarea = document.createElement("textarea");
    const remove = document.createElement("button");

    item.className = "idea-block";
    item.dataset.ideaBlock = String(blockIndex);
    item.style.setProperty("--item-color", getPlanColor(blockIndex));

    textarea.className = "idea-text-input";
    textarea.rows = 5;
    textarea.value = block.text || "";
    textarea.placeholder = "把这一块想法先记下来";
    textarea.setAttribute("aria-label", `构思 ${ideaIndex + 1} 的第 ${blockIndex + 1} 块内容`);
    textarea.dataset.ideaBlockText = "";

    remove.className = "gantt-delete";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `删除构思块 ${blockIndex + 1}`);
    remove.dataset.ideaBlockDelete = String(blockIndex);

    item.append(textarea, remove);
    return item;
  }

  function renderResourceItems() {
    resourceList.innerHTML = "";

    siteContent.resources.items.forEach((item, index) => {
      const row = document.createElement("li");
      const label = document.createElement("input");
      const fields = document.createElement("div");
      const title = document.createElement("input");
      const url = document.createElement("input");
      const controls = document.createElement("div");
      const moveUp = createReorderButton(`上移资料 ${index + 1}`, -1, index === 0, "resourceMove");
      const moveDown = createReorderButton(`下移资料 ${index + 1}`, 1, index === siteContent.resources.items.length - 1, "resourceMove");
      const remove = document.createElement("button");

      row.dataset.resourceItem = String(index);
      label.className = "resource-label-input";
      label.type = "text";
      label.value = item.label || "RESOURCE";
      label.setAttribute("aria-label", "资料分类");
      label.dataset.resourceField = "label";
      fields.className = "resource-fields";

      title.type = "text";
      title.value = item.title || "";
      title.placeholder = "网站或资料名称";
      title.setAttribute("aria-label", "资料名称");
      title.dataset.resourceField = "title";

      url.type = "url";
      url.value = item.url || "";
      url.placeholder = "https://example.com";
      url.setAttribute("aria-label", "资料链接");
      url.dataset.resourceField = "url";

      remove.className = "gantt-delete";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `删除资料 ${index + 1}`);
      remove.dataset.resourceDelete = String(index);

      controls.className = "item-reorder";
      controls.append(moveUp, moveDown, remove);
      fields.append(title, url);
      row.append(label, fields, controls);
      resourceList.append(row);
    });
  }

  function collectEditableSections() {
    siteContent.ideas.items = [...ideaGrid.querySelectorAll("[data-idea-item]")]
      .map((item) => {
        const blocks = [...item.querySelectorAll("[data-idea-block]")]
          .map((block) => ({
            id: createPlanId(),
            text: block.querySelector("[data-idea-block-text]").value.trim(),
          }))
          .filter((block) => block.text);

        return {
          label: item.querySelector('[data-idea-field="label"]').value.trim(),
          title: item.querySelector('[data-idea-field="title"]').value.trim(),
          text: blocks.map((block) => block.text).join("\n"),
          blocks,
        };
      })
      .filter((item) => item.title || item.blocks.length);

    siteContent.resources.items = [...resourceList.querySelectorAll("[data-resource-item]")]
      .map((item) => ({
        label: item.querySelector('[data-resource-field="label"]').value.trim(),
        title: item.querySelector('[data-resource-field="title"]').value.trim(),
        url: item.querySelector('[data-resource-field="url"]').value.trim(),
      }))
      .filter((item) => item.title || item.url);

    siteContent = mergeSiteContent(defaultSiteContent, siteContent);
    renderSiteEditor();
  }

  async function persistSiteContent(statusElement, syncedMessage, localMessage, failedMessage) {
    saveSiteContentLocal();

    if (cloud.ready) {
      try {
        await saveCloudSiteContent();
        showSectionStatus(statusElement, syncedMessage);
      } catch (error) {
        showSectionStatus(statusElement, failedMessage);
        console.error(error);
      }
      return;
    }

    showSectionStatus(statusElement, localOnlyMessage(localMessage.replace(/。$/, "")));
  }

  function showSectionStatus(statusElement, message) {
    if (!statusElement) {
      return;
    }

    const timerKey = statusElement === ideaStatus ? "idea" : "resource";

    if (timerKey === "idea") {
      clearTimeout(ideaStatusTimer);
      ideaStatusTimer = setTimeout(() => {
        statusElement.textContent = "";
      }, 2400);
    } else {
      clearTimeout(resourceStatusTimer);
      resourceStatusTimer = setTimeout(() => {
        statusElement.textContent = "";
      }, 2400);
    }

    statusElement.textContent = message;
  }

  function scheduleEditableLocalSave() {
    clearTimeout(quickSaveTimer);
    quickSaveTimer = setTimeout(() => {
      collectEditableSections();
      saveSiteContentLocal();
    }, 450);
  }

  function renderSiteEditor() {
    siteEditorFields.innerHTML = "";
    appendEditorSection("基础", [
      ["网站名称", "brand"],
      ["日程导航英文", "nav.scheduleLabel"],
      ["日程导航中文", "nav.scheduleSub"],
      ["构思导航英文", "nav.ideasLabel"],
      ["构思导航中文", "nav.ideasSub"],
      ["资料导航英文", "nav.resourcesLabel"],
      ["资料导航中文", "nav.resourcesSub"],
    ]);
    appendEditorSection("首页", [
      ["首页标识", "home.eyebrow"],
      ["首页标题", "home.title"],
      ["入口按钮", "home.cta"],
    ]);
    appendEditorSection("日程", [
      ["栏目标识", "schedule.eyebrow"],
      ["栏目标题", "schedule.title"],
      ["栏目说明", "schedule.description", "textarea"],
    ]);
    appendCollectionEditor("构思", "ideas", "新增构思", [
      ["编号", "label"],
      ["标题", "title"],
      ["内容", "text", "textarea"],
    ]);
    appendCollectionEditor("资料", "resources", "新增资料", [
      ["分类", "label"],
      ["标题", "title"],
      ["链接", "url"],
    ]);
  }

  function appendEditorSection(title, fields) {
    const section = document.createElement("section");
    section.className = "site-editor-block";
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.append(heading);

    fields.forEach(([label, path, type]) => {
      section.append(createEditorField(label, path, type));
    });

    siteEditorFields.append(section);
  }

  function appendCollectionEditor(title, collectionKey, addLabel, fields) {
    const section = document.createElement("section");
    section.className = "site-editor-block";
    const header = document.createElement("div");
    header.className = "site-editor-block-header";
    const heading = document.createElement("h3");
    const addButton = document.createElement("button");

    heading.textContent = title;
    addButton.className = "ghost-button";
    addButton.type = "button";
    addButton.textContent = addLabel;
    addButton.dataset.editorAdd = collectionKey;

    header.append(heading, addButton);
    section.append(header);

    siteContent[collectionKey].items.forEach((item, index) => {
      const itemBlock = document.createElement("div");
      itemBlock.className = "site-editor-item";
      const itemHeader = document.createElement("div");
      itemHeader.className = "site-editor-item-header";
      const itemTitle = document.createElement("strong");
      const removeButton = document.createElement("button");

      itemTitle.textContent = `${title} ${index + 1}`;
      removeButton.className = "gantt-delete";
      removeButton.type = "button";
      removeButton.textContent = "×";
      removeButton.setAttribute("aria-label", `删除${title} ${index + 1}`);
      removeButton.dataset.editorRemove = collectionKey;
      removeButton.dataset.editorIndex = String(index);

      itemHeader.append(itemTitle, removeButton);
      itemBlock.append(itemHeader);

      fields.forEach(([label, key, type]) => {
        const path = `${collectionKey}.items.${index}.${key}`;
        itemBlock.append(createEditorField(label, path, type));
      });

      section.append(itemBlock);
    });

    siteEditorFields.append(section);
  }

  function createEditorField(labelText, path, type = "input") {
    const label = document.createElement("label");
    const labelName = document.createElement("span");
    const control = type === "textarea" ? document.createElement("textarea") : document.createElement("input");

    label.className = "site-editor-field";
    labelName.textContent = labelText;
    control.value = getPath(siteContent, path) || "";
    control.dataset.editorPath = path;

    if (type === "textarea") {
      control.rows = 3;
    } else {
      control.type = "text";
    }

    label.append(labelName, control);
    return label;
  }

  function collectSiteEditorForm() {
    siteEditorForm.querySelectorAll("[data-editor-path]").forEach((control) => {
      setPath(siteContent, control.dataset.editorPath, control.value.trim());
    });
    siteContent = mergeSiteContent(defaultSiteContent, siteContent);
    monthlyPlans = normalizeMonthlyPlans(siteContent.monthlyPlans);
    yearlyPlans = normalizeYearlyPlans(siteContent.yearlyPlans);
  }

  function addEditorItem(collectionKey) {
    if (collectionKey === "ideas") {
      const nextNumber = siteContent.ideas.items.length + 1;
      siteContent.ideas.items.push({
        label: `IDEA ${pad(nextNumber)}`,
        title: "新的构思",
        text: "",
        blocks: [{ id: createPlanId(), text: "" }],
      });
      return;
    }

    if (collectionKey === "resources") {
      siteContent.resources.items.push({
        label: "NEW",
        title: "新的资料",
        url: "#",
      });
    }
  }

  function removeEditorItem(collectionKey, index) {
    const items = siteContent[collectionKey]?.items;

    if (!Array.isArray(items) || !Number.isFinite(index) || index < 0 || index >= items.length) {
      return;
    }

    items.splice(index, 1);
  }

  function moveEditorItem(collectionKey, index, direction) {
    const items = siteContent[collectionKey]?.items;
    const nextIndex = index + direction;

    if (!Array.isArray(items) || !Number.isFinite(index) || !Number.isFinite(direction) || nextIndex < 0 || nextIndex >= items.length) {
      return false;
    }

    const [item] = items.splice(index, 1);
    items.splice(nextIndex, 0, item);
    return true;
  }

  function mergeSiteContent(base, override) {
    const source = override && typeof override === "object" ? override : {};

    return {
      brand: stringOr(source.brand, base.brand),
      nav: {
        scheduleLabel: stringOr(source.nav?.scheduleLabel, base.nav.scheduleLabel),
        scheduleSub: stringOr(source.nav?.scheduleSub, base.nav.scheduleSub),
        ideasLabel: stringOr(source.nav?.ideasLabel, base.nav.ideasLabel),
        ideasSub: stringOr(source.nav?.ideasSub, base.nav.ideasSub),
        resourcesLabel: stringOr(source.nav?.resourcesLabel, base.nav.resourcesLabel),
        resourcesSub: stringOr(source.nav?.resourcesSub, base.nav.resourcesSub),
      },
      home: {
        eyebrow: normalizeHomeEyebrow(stringOr(source.home?.eyebrow, base.home.eyebrow)),
        title: stringOr(source.home?.title, base.home.title),
        description: stringOr(source.home?.description, base.home.description),
        cta: stringOr(source.home?.cta, base.home.cta),
      },
      schedule: {
        eyebrow: stringOr(source.schedule?.eyebrow, base.schedule.eyebrow),
        title: stringOr(source.schedule?.title, base.schedule.title),
        description: stringOr(source.schedule?.description, base.schedule.description),
      },
      ideas: {
        eyebrow: stringOr(source.ideas?.eyebrow, base.ideas.eyebrow),
        title: stringOr(source.ideas?.title, base.ideas.title),
        description: stringOr(source.ideas?.description, base.ideas.description),
        items: normalizeIdeaItems(source.ideas?.items, base.ideas.items),
      },
      resources: {
        eyebrow: stringOr(source.resources?.eyebrow, base.resources.eyebrow),
        title: stringOr(source.resources?.title, base.resources.title),
        description: stringOr(source.resources?.description, base.resources.description),
        items: normalizeCollection(source.resources?.items, base.resources.items, ["label", "title", "url"]),
      },
      monthlyPlans: normalizeMonthlyPlans(source.monthlyPlans),
      yearlyPlans: normalizeYearlyPlans(source.yearlyPlans),
    };
  }

  function normalizeHomeEyebrow(value) {
    return value.replace("hdl4xl LAB", "SHERRY LAB");
  }

  function normalizeCollection(items, fallback, keys) {
    const source = Array.isArray(items) ? items : fallback;

    return source.map((item) => {
      const nextItem = {};
      keys.forEach((key) => {
        nextItem[key] = stringOr(item?.[key], "");
      });
      return nextItem;
    });
  }

  function normalizeIdeaItems(items, fallback) {
    const source = Array.isArray(items) ? items : fallback;

    return source.map((item) => {
      const blocks = normalizeIdeaBlocks(item?.blocks, item?.text);

      return {
        label: stringOr(item?.label, ""),
        title: stringOr(item?.title, ""),
        text: blocks.map((block) => block.text).join("\n"),
        blocks,
      };
    });
  }

  function normalizeIdeaBlocks(blocks, legacyText) {
    if (Array.isArray(blocks)) {
      return blocks
        .map((block) => ({
          id: stringOr(block?.id, createPlanId()),
          text: stringOr(block?.text, ""),
        }))
        .filter((block) => block.text);
    }

    if (typeof legacyText === "string" && legacyText.trim()) {
      return [{ id: createPlanId(), text: legacyText.trim() }];
    }

    return [];
  }

  function normalizeMonthlyPlans(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value)
        .map(([month, plan]) => {
          const sourceTasks = Array.isArray(plan) ? plan : plan?.tasks;

          return [
            month,
            {
              progress: clampProgress(Array.isArray(plan) ? 0 : plan?.progress),
              tasks: normalizePlanTasks(sourceTasks, ["start", "end"]),
            },
          ];
        })
        .filter(([, plan]) => plan.tasks.length || plan.progress),
    );
  }

  function normalizeYearlyPlans(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value)
        .map(([year, plan]) => {
          const sourceTasks = Array.isArray(plan) ? plan : plan?.tasks;

          return [
            year,
            {
              tasks: normalizePlanTasks(sourceTasks, ["start", "end"]),
            },
          ];
        })
        .filter(([, plan]) => plan.tasks.length),
    );
  }

  function normalizePlanTasks(tasks, rangeKeys) {
    if (!Array.isArray(tasks)) {
      return [];
    }

    return tasks
      .map((task) => ({
        id: stringOr(task?.id, createPlanId()),
        title: stringOr(task?.title, ""),
        [rangeKeys[0]]: Number(task?.[rangeKeys[0]]) || 1,
        [rangeKeys[1]]: Number(task?.[rangeKeys[1]]) || 1,
        progress: clampProgress(task?.progress),
      }))
      .filter((task) => task.title);
  }

  function normalizeSchedules(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value)
        .map(([dateKey, items]) => [dateKey, normalizeScheduleItems(items)])
        .filter(([, items]) => items.length),
    );
  }

  function normalizeScheduleItems(value) {
    if (Array.isArray(value)) {
      return value
        .map((item) => ({
          id: stringOr(item?.id, createPlanId()),
          text: stringOr(item?.text, "").trim(),
        }))
        .filter((item) => item.text);
    }

    if (typeof value === "string" && value.trim()) {
      return [
        {
          id: createPlanId(),
          text: value.trim(),
        },
      ];
    }

    return [];
  }

  function setScheduleView(view) {
    const nextView = ["day", "month", "year"].includes(view) ? view : "day";

    scheduleTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.scheduleView === nextView);
    });

    schedulePanels.forEach((panel) => {
      panel.hidden = panel.dataset.schedulePanel !== nextView;
    });
  }

  function getPath(source, path) {
    return path.split(".").reduce((value, key) => value?.[key], source);
  }

  function setPath(source, path, value) {
    const keys = path.split(".");
    let cursor = source;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        cursor[key] = value;
        return;
      }

      if (!cursor[key]) {
        cursor[key] = /^\d+$/.test(keys[index + 1]) ? [] : {};
      }

      cursor = cursor[key];
    });
  }

  function stringOr(value, fallback) {
    return typeof value === "string" ? value : fallback;
  }

  function sanitizeResourceUrl(value) {
    const url = typeof value === "string" ? value.trim() : "";

    if (!url) {
      return "#";
    }

    if (/^(https?:|mailto:|#|\/)/i.test(url)) {
      return url;
    }

    return "#";
  }

  function loadLocalSchedules() {
    const saved = readStorage();

    if (saved) {
      return normalizeSchedules(saved);
    }

    const normalizedDefaults = normalizeSchedules(defaultSchedules);
    writeStorage(normalizedDefaults);
    return normalizedDefaults;
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

  function loadMonthlyPlans() {
    const contentPlans = normalizeMonthlyPlans(siteContent.monthlyPlans);

    if (Object.keys(contentPlans).length) {
      return contentPlans;
    }

    try {
      const raw = localStorage.getItem(legacyPlanKey);
      return raw ? normalizeMonthlyPlans(JSON.parse(raw)) : {};
    } catch {
      return {};
    }
  }

  function saveMonthlyPlans() {
    siteContent.monthlyPlans = normalizeMonthlyPlans(monthlyPlans);
    saveSiteContentLocal();

    try {
      localStorage.setItem(legacyPlanKey, JSON.stringify(monthlyPlans));
    } catch {
      showStatus("浏览器未允许保存月度计划。");
    }
  }

  function loadYearlyPlans() {
    return normalizeYearlyPlans(siteContent.yearlyPlans);
  }

  function saveYearlyPlans() {
    siteContent.yearlyPlans = normalizeYearlyPlans(yearlyPlans);
    saveSiteContentLocal();
  }

  async function initCloudSync() {
    if (!cloud.configured) {
      setSyncState("local");
      return;
    }

    try {
      setSyncState("loading");

      const [{ initializeApp }, firestoreApi] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-firestore.js`),
      ]);

      const app = initializeApp(window.FIREBASE_CONFIG);
      cloud.db = firestoreApi.getFirestore(app);
      cloud.api = { ...firestoreApi };
      cloud.ready = true;

      await refreshCloudContent({ forceServer: true });
      subscribeCloudSchedules();
      cloud.lastError = null;
      setSyncState("public");
    } catch (error) {
      cloud.ready = false;
      cloud.lastError = error;
      setSyncState("error");
      console.error(error);
    }
  }

  async function refreshCloudContent(options = {}) {
    await loadCloudSiteContent(options);

    if (cloud.ready) {
      await loadCloudSchedules(options);
    }

    updateEditorSyncState();
  }

  async function loadCloudSiteContent(options = {}) {
    const { doc, getDoc, getDocFromServer } = cloud.api;
    const documentRef = doc(cloud.db, "siteContent", "main");
    const snapshot = options.forceServer && getDocFromServer ? await getDocFromServer(documentRef) : await getDoc(documentRef);

    if (!snapshot.exists()) {
      return;
    }

    const data = snapshot.data();
    siteContent = mergeSiteContent(defaultSiteContent, data.content);
    monthlyPlans = normalizeMonthlyPlans(siteContent.monthlyPlans);
    yearlyPlans = normalizeYearlyPlans(siteContent.yearlyPlans);
    saveSiteContentLocal();
    applySiteContent();
    renderSiteEditor();
    renderMonthlyPlan();
    renderYearlyPlan();
  }

  async function saveCloudSiteContent() {
    const { doc, serverTimestamp, setDoc } = cloud.api;
    await setDoc(
      doc(cloud.db, "siteContent", "main"),
      {
        content: siteContent,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async function loadCloudSchedules(options = {}) {
    const { collection, getDocs, getDocsFromServer } = cloud.api;
    const schedulesRef = collection(cloud.db, "publicSchedules");
    const snapshot = options.forceServer && getDocsFromServer ? await getDocsFromServer(schedulesRef) : await getDocs(schedulesRef);

    applyCloudScheduleSnapshot(snapshot);
  }

  function subscribeCloudSchedules() {
    if (cloud.unsubscribeSchedules || !cloud.api?.onSnapshot) {
      return;
    }

    const { collection, onSnapshot } = cloud.api;
    const schedulesRef = collection(cloud.db, "publicSchedules");

    cloud.unsubscribeSchedules = onSnapshot(
      schedulesRef,
      (snapshot) => {
        applyCloudScheduleSnapshot(snapshot);
        cloud.lastError = null;
      },
      (error) => {
        cloud.lastError = error;
        setSyncState("error");
        console.error(error);
      },
    );
  }

  function applyCloudScheduleSnapshot(snapshot) {
    const cloudSchedules = {};

    snapshot.forEach((document) => {
      const data = document.data();
      const items = normalizeScheduleItems(Array.isArray(data.items) ? data.items : data.text);

      if (items.length) {
        cloudSchedules[document.id] = items;
      }
    });

    schedules = cloudSchedules;
    saveLocalSchedules();
    renderCalendar();
    updateEditor(false);
  }

  async function saveCloudSchedule(dateKey, items) {
    const { deleteDoc, doc, serverTimestamp, setDoc } = cloud.api;
    const documentRef = doc(cloud.db, "publicSchedules", dateKey);
    const normalizedItems = normalizeScheduleItems(items);

    if (!normalizedItems.length) {
      await deleteDoc(documentRef);
      return;
    }

    await setDoc(documentRef, {
      items: normalizedItems,
      text: normalizedItems.map((item) => item.text).join("\n"),
      date: dateKey,
      updatedAt: serverTimestamp(),
    });
  }

  function setSyncState(state) {
    syncLogin.hidden = false;
    syncUserId.hidden = true;
    syncUserId.textContent = "";
    syncLogin.disabled = false;
    syncLoginLabel.textContent = "公共在线";
    syncStatus.textContent = "SYNC";
    syncLogin.title = "公共同步";
    updateEditorSyncState("正在连接公共云端。");

    if (state === "local") {
      syncStatus.textContent = "SYNC";
      syncLogin.title = "本地模式：公共云端未连接";
      syncLogin.disabled = true;
      updateEditorSyncState("当前是本地模式：内容只能保存在本机，不能同步给其他人。");
      return;
    }

    if (state === "loading") {
      syncStatus.textContent = "SYNC";
      syncLogin.title = "正在同步公共云端内容";
      syncLogin.disabled = true;
      updateEditorSyncState("正在同步公共云端内容。");
      return;
    }

    if (state === "public") {
      syncStatus.textContent = "SYNC";
      syncLogin.title = "公共同步已开启";
      updateEditorSyncState("公共同步已开启：任何人保存后，所有访问者都能看到。");
      return;
    }

    syncStatus.textContent = "SYNC";
    syncLogin.title = "连接异常";
    updateEditorSyncState(getCloudErrorMessage(cloud.lastError));
  }

  function showCurrentUid() {
    syncUserId.hidden = false;
    syncUserId.textContent = "Public cloud mode";
  }

  function updateEditorSyncState(message) {
    if (!editorSyncState) {
      return;
    }

    if (message) {
      editorSyncState.textContent = message;
      return;
    }

    editorSyncState.textContent = cloud.ready
      ? "公共同步已开启：任何人保存后，所有访问者都能看到。"
      : "公共云端未连接：保存只在本机生效。";
  }

  function showGlobalStatus(message) {
    syncStatus.textContent = "SYNC";
    syncLogin.title = message;

    if (siteEditor && !siteEditor.hidden) {
      showEditorStatus(message);
      return;
    }

    showStatus(message);
  }

  function localOnlyMessage(action) {
    return `${action}；公共云端未连接，只保存在本机，其他人暂时看不到。`;
  }

  function getCloudErrorMessage(error) {
    if (error?.code === "permission-denied") {
      return "公共云端权限不足：请把 Firebase Firestore 规则改成允许 siteContent 和 publicSchedules 公共读写。";
    }

    if (error?.code === "not-found") {
      return "没有找到 Firestore 数据库：请先在 Firebase 左侧 Firestore 中创建数据库。";
    }

    if (error?.code === "unavailable") {
      return "公共云端连接失败：请检查网络或稍后重试。";
    }

    if (error?.code === "failed-precondition") {
      return "Firestore 数据库未就绪或规则配置不完整。";
    }

    const detail = error?.code ? `错误代码：${error.code}` : "没有返回错误代码";
    return `连接异常：请检查 Firebase 公共读写规则和 Firestore 是否已创建。${detail}`;
  }

  function hasFirebaseConfig() {
    const config = window.FIREBASE_CONFIG || {};
    return ["apiKey", "authDomain", "projectId", "appId"].every(
      (key) => typeof config[key] === "string" && config[key].trim(),
    );
  }

  function renderMonthlyPlan() {
    const key = toMonthKey(activePlanMonth);
    const daysInMonth = getDaysInMonth(activePlanMonth);
    const monthPlan = ensureMonthPlan(key, daysInMonth);

    planMonthTitle.textContent = `${formatMonth(activePlanMonth)}计划`;
    renderGanttScale(daysInMonth);
    ganttRows.innerHTML = "";

    monthPlan.tasks.forEach((task, index) => {
      ganttRows.append(createGanttRow(task, daysInMonth, index));
    });
  }

  function ensureMonthPlan(key, daysInMonth) {
    const normalized = normalizeMonthlyPlans({ [key]: monthlyPlans[key] })[key];

    if (normalized) {
      monthlyPlans[key] = normalized;
      return monthlyPlans[key];
    }

    monthlyPlans[key] = {
      progress: 0,
      tasks: buildDefaultMonthTasks(daysInMonth),
    };
    saveMonthlyPlans();
    return monthlyPlans[key];
  }

  function renderGanttScale(daysInMonth) {
    ganttScale.innerHTML = "";
    ganttScale.style.gridTemplateColumns = `repeat(${daysInMonth}, minmax(18px, 1fr))`;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayLabel = document.createElement("span");
      dayLabel.textContent = day;
      ganttScale.append(dayLabel);
    }
  }

  function createGanttRow(task, daysInMonth, index) {
    const start = clampDay(task.start, daysInMonth);
    const end = clampDay(Math.max(task.end, start), daysInMonth);
    const progress = clampProgress(task.progress);
    const row = document.createElement("div");
    row.className = "gantt-row";
    row.dataset.planId = task.id;
    row.style.setProperty("--plan-color", getPlanColor(index));

    const fields = document.createElement("div");
    fields.className = "gantt-fields";

    const title = document.createElement("input");
    title.className = "gantt-title";
    title.type = "text";
    title.placeholder = "计划名称";
    title.value = task.title || "";

    const startInput = document.createElement("input");
    startInput.className = "gantt-start";
    startInput.type = "number";
    startInput.min = "1";
    startInput.max = String(daysInMonth);
    startInput.value = String(start);
    startInput.setAttribute("aria-label", "开始日期");

    const endInput = document.createElement("input");
    endInput.className = "gantt-end";
    endInput.type = "number";
    endInput.min = "1";
    endInput.max = String(daysInMonth);
    endInput.value = String(end);
    endInput.setAttribute("aria-label", "结束日期");

    const progressInput = document.createElement("input");
    progressInput.className = "gantt-progress";
    progressInput.type = "number";
    progressInput.min = "0";
    progressInput.max = "100";
    progressInput.step = "1";
    progressInput.value = String(progress);
    progressInput.setAttribute("aria-label", "完成进度");

    const track = document.createElement("div");
    track.className = "gantt-track";
    track.style.setProperty("--days", daysInMonth);

    const bar = document.createElement("span");
    bar.className = "gantt-bar";
    bar.style.setProperty("--days", daysInMonth);
    bar.style.setProperty("--start", start);
    bar.style.setProperty("--span", end - start + 1);
    track.append(bar);

    const remove = document.createElement("button");
    remove.className = "gantt-delete";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "删除计划");
    remove.addEventListener("click", () => {
      syncCurrentMonthPlan();
      const key = toMonthKey(activePlanMonth);
      monthlyPlans[key].tasks = monthlyPlans[key].tasks.filter((item) => item.id !== task.id);
      saveMonthlyPlans();
      renderMonthlyPlan();
    });

    const progressLabel = document.createElement("span");
    progressLabel.className = "task-progress-label";
    progressLabel.textContent = "/ 100%";

    const progressField = document.createElement("div");
    progressField.className = "task-progress-field";
    progressField.append(progressInput, progressLabel);

    fields.append(title, startInput, endInput, progressField);
    row.append(fields, track, remove);
    return row;
  }

  function syncCurrentMonthPlan() {
    const key = toMonthKey(activePlanMonth);
    const daysInMonth = getDaysInMonth(activePlanMonth);
    const rows = [...ganttRows.querySelectorAll(".gantt-row")];
    const monthPlan = ensureMonthPlan(key, daysInMonth);

    monthPlan.tasks = rows
      .map((row) => {
        const title = row.querySelector(".gantt-title").value.trim();
        const start = clampDay(Number(row.querySelector(".gantt-start").value), daysInMonth);
        const end = clampDay(Number(row.querySelector(".gantt-end").value), daysInMonth);
        const progress = clampProgress(row.querySelector(".gantt-progress").value);

        return {
          id: row.dataset.planId || createPlanId(),
          title,
          start: Math.min(start, end),
          end: Math.max(start, end),
          progress,
        };
      })
      .filter((task) => task.title);
  }

  function buildDefaultMonthTasks(daysInMonth) {
    return [
      {
        id: createPlanId(),
        title: "整理本月重点事项",
        start: 1,
        end: Math.min(7, daysInMonth),
        progress: 0,
      },
      {
        id: createPlanId(),
        title: "完成阶段性输出",
        start: Math.min(8, daysInMonth),
        end: Math.min(18, daysInMonth),
        progress: 0,
      },
      {
        id: createPlanId(),
        title: "复盘与资料归档",
        start: Math.min(22, daysInMonth),
        end: daysInMonth,
        progress: 0,
      },
    ];
  }

  function renderYearlyPlan() {
    const yearPlan = ensureYearPlan(activeYear);

    yearPlanTitle.textContent = `${activeYear}年年度计划`;
    yearRows.innerHTML = "";

    yearPlan.tasks.forEach((task, index) => {
      yearRows.append(createYearRow(task, index));
    });
  }

  function ensureYearPlan(year) {
    const key = String(year);
    const normalized = normalizeYearlyPlans({ [key]: yearlyPlans[key] })[key];

    if (normalized) {
      yearlyPlans[key] = normalized;
      return yearlyPlans[key];
    }

    yearlyPlans[key] = {
      tasks: buildDefaultYearTasks(),
    };
    saveYearlyPlans();
    return yearlyPlans[key];
  }

  function createYearRow(task, index) {
    const start = clampMonth(task.start);
    const end = clampMonth(Math.max(task.end, start));
    const row = document.createElement("div");
    row.className = "year-row";
    row.dataset.yearPlanId = task.id;
    row.style.setProperty("--plan-color", getPlanColor(index + 2));

    const fields = document.createElement("div");
    fields.className = "year-fields";

    const title = document.createElement("input");
    title.className = "year-title";
    title.type = "text";
    title.placeholder = "年度计划名称";
    title.value = task.title || "";

    const startInput = document.createElement("input");
    startInput.className = "year-start";
    startInput.type = "number";
    startInput.min = "1";
    startInput.max = "12";
    startInput.value = String(start);
    startInput.setAttribute("aria-label", "开始月份");

    const endInput = document.createElement("input");
    endInput.className = "year-end";
    endInput.type = "number";
    endInput.min = "1";
    endInput.max = "12";
    endInput.value = String(end);
    endInput.setAttribute("aria-label", "结束月份");

    const remove = document.createElement("button");
    remove.className = "gantt-delete";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "删除年度计划");
    remove.addEventListener("click", () => {
      syncCurrentYearPlan();
      const key = String(activeYear);
      yearlyPlans[key].tasks = yearlyPlans[key].tasks.filter((item) => item.id !== task.id);
      saveYearlyPlans();
      renderYearlyPlan();
    });

    fields.append(title, startInput, endInput);
    row.append(fields, remove);
    return row;
  }

  function syncCurrentYearPlan() {
    const key = String(activeYear);
    const yearPlan = ensureYearPlan(activeYear);
    const rows = [...yearRows.querySelectorAll(".year-row")];

    yearPlan.tasks = rows
      .map((row) => {
        const title = row.querySelector(".year-title").value.trim();
        const start = clampMonth(Number(row.querySelector(".year-start").value));
        const end = clampMonth(Number(row.querySelector(".year-end").value));

        return {
          id: row.dataset.yearPlanId || createPlanId(),
          title,
          start: Math.min(start, end),
          end: Math.max(start, end),
        };
      })
      .filter((task) => task.title);

    yearlyPlans[key] = yearPlan;
  }

  function buildDefaultYearTasks() {
    return [
      {
        id: createPlanId(),
        title: "年度重点目标",
        start: 1,
        end: 4,
      },
      {
        id: createPlanId(),
        title: "阶段推进与输出",
        start: 5,
        end: 9,
      },
      {
        id: createPlanId(),
        title: "年度复盘与归档",
        start: 10,
        end: 12,
      },
    ];
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

  function appendAgendaPreview(container, agendaItems) {
    const items = normalizeScheduleItems(agendaItems);

    if (!items.length) {
      return;
    }

    items.forEach((item, index) => {
      const agendaLine = document.createElement("span");
      agendaLine.className = "agenda-line";
      agendaLine.style.setProperty("--item-color", getPlanColor(index));
      agendaLine.textContent = item.text.replace(/\s+/g, " ");
      container.append(agendaLine);
    });
  }

  function updateEditor(shouldFocus) {
    selectedDateTitle.textContent = formatDateTitle(selectedDateKey);
    renderScheduleItems(normalizeScheduleItems(schedules[selectedDateKey]), shouldFocus);
  }

  function renderScheduleItems(items, shouldFocus) {
    const editorItems = Array.isArray(items)
      ? items.map((item) => ({
          id: stringOr(item?.id, createPlanId()),
          text: stringOr(item?.text, ""),
        }))
      : normalizeScheduleItems(items);

    scheduleItemsRoot.innerHTML = "";

    if (!editorItems.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-schedule";
      emptyState.textContent = "当天还没有计划，点击“新增计划”开始记录。";
      scheduleItemsRoot.append(emptyState);

      if (shouldFocus) {
        addScheduleItem.focus({ preventScroll: true });
      }
      return;
    }

    editorItems.forEach((item, index) => {
      const row = document.createElement("div");
      const textarea = document.createElement("textarea");
      const remove = document.createElement("button");

      row.className = "schedule-item";
      row.dataset.scheduleItem = item.id || createPlanId();
      row.style.setProperty("--item-color", getPlanColor(index));

      textarea.rows = 4;
      textarea.value = item.text || "";
      textarea.placeholder = "写下这一条计划";
      textarea.setAttribute("aria-label", `第 ${index + 1} 条当天计划`);
      textarea.dataset.scheduleText = "";

      remove.className = "gantt-delete";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `删除第 ${index + 1} 条当天计划`);
      remove.dataset.scheduleDelete = "";

      row.append(textarea, remove);
      scheduleItemsRoot.append(row);
    });

    if (shouldFocus) {
      const focusTarget = scheduleItemsRoot.querySelector(".schedule-item:last-child textarea");
      focusTarget?.focus({ preventScroll: true });
    }
  }

  function collectScheduleItems(options = {}) {
    const items = [...scheduleItemsRoot.querySelectorAll("[data-schedule-item]")].map((item) => ({
      id: item.dataset.scheduleItem || createPlanId(),
      text: item.querySelector("[data-schedule-text]").value.trim(),
    }));

    return options.keepEmpty ? items : items.filter((item) => item.text);
  }

  function showStatus(message) {
    saveStatus.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      saveStatus.textContent = "";
    }, 2200);
  }

  function showEditorStatus(message) {
    siteEditorStatus.textContent = message;
    clearTimeout(editorStatusTimer);
    editorStatusTimer = setTimeout(() => {
      siteEditorStatus.textContent = "";
    }, 2600);
  }

  function formatMonth(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }

  function toMonthKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
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

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function clampDay(value, daysInMonth) {
    const number = Number.isFinite(value) ? value : 1;
    return Math.min(Math.max(Math.round(number), 1), daysInMonth);
  }

  function clampMonth(value) {
    const number = Number.isFinite(value) ? value : 1;
    return Math.min(Math.max(Math.round(number), 1), 12);
  }

  function clampProgress(value) {
    const number = Number(value);
    const safeNumber = Number.isFinite(number) ? number : 0;
    return Math.min(Math.max(Math.round(safeNumber), 0), 100);
  }

  function getPlanColor(index) {
    return colorPalette[Math.abs(index) % colorPalette.length];
  }

  function createPlanId() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
