document.addEventListener("DOMContentLoaded", () => {
  const notesLayout = document.querySelector(".notes-layout");
  if (!notesLayout) {
    return;
  }

  const topicSearchInput = document.querySelector("#notes-topic-search");
  const cardSearchInput = document.querySelector("#notes-card-search");
  const resetButton = document.querySelector("[data-notes-reset]");
  const filterStatus = document.querySelector("[data-notes-filter-status]");
  const emptyState = document.querySelector("[data-notes-empty]");
  const topicItems = Array.from(document.querySelectorAll("[data-topic-item]"));
  const topicPanels = Array.from(document.querySelectorAll(".notes-topic-panel"));
  const topicTriggers = Array.from(document.querySelectorAll("[data-topic-trigger]"));
  const noteCards = Array.from(document.querySelectorAll("[data-note-card]"));

  let activeTopic = "";
  let activeTopicLabel = "";

  const normalize = (value) => (value || "").trim().toLowerCase();

  const cardMatchesTopic = (card, topic) => {
    if (!topic) {
      return true;
    }

    const tags = (card.dataset.tags || "")
      .split("||")
      .map((item) => normalize(item))
      .filter(Boolean);

    return tags.includes(topic);
  };

  const applyTopicVisibility = () => {
    const query = normalize(topicSearchInput ? topicSearchInput.value : "");

    topicItems.forEach((item) => {
      const topic = normalize(item.dataset.topic);
      const noteItems = Array.from(item.querySelectorAll("[data-topic-note]"));
      let hasVisibleNote = false;

      noteItems.forEach((node) => {
        const matchedNote = !query || normalize(node.dataset.topicNote).includes(query);
        node.hidden = !matchedNote;
        if (matchedNote) {
          hasVisibleNote = true;
        }
      });

      const matched = !query || topic.includes(query) || hasVisibleNote;
      item.classList.toggle("is-hidden", !matched);

      const panel = item.querySelector(".notes-topic-panel");
      if (panel && query && matched) {
        panel.open = true;
      }
    });
  };

  const applyCardFilters = () => {
    const query = normalize(cardSearchInput ? cardSearchInput.value : "");
    let visibleCount = 0;

    noteCards.forEach((card) => {
      const matchesTopic = cardMatchesTopic(card, activeTopic);
      const matchesQuery = !query || normalize(card.dataset.search).includes(query);
      const visible = matchesTopic && matchesQuery;

      card.classList.toggle("is-hidden", !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }

    if (filterStatus) {
      if (activeTopic && query) {
        filterStatus.textContent = `当前按专栏“${activeTopicLabel}”筛选，并搜索“${query}”，共 ${visibleCount} 条结果`;
      } else if (activeTopic) {
        filterStatus.textContent = `当前按专栏“${activeTopicLabel}”筛选，共 ${visibleCount} 条结果`;
      } else if (query) {
        filterStatus.textContent = `当前搜索“${query}”，共 ${visibleCount} 条结果`;
      } else {
        filterStatus.textContent = "当前显示全部笔记";
      }
    }
  };

  const updateActiveTopicStyles = () => {
    topicPanels.forEach((panel) => panel.classList.remove("is-active"));
    topicTriggers.forEach((trigger) => {
      const panel = trigger.closest(".notes-topic-panel");
      if (!panel) {
        return;
      }

      const isActive = normalize(trigger.dataset.topic) === activeTopic && activeTopic;
      panel.classList.toggle("is-active", Boolean(isActive));
      if (isActive) {
        panel.open = true;
      }
    });

    if (resetButton) {
      resetButton.classList.toggle("is-active", !activeTopic);
    }
  };

  topicTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const nextTopic = normalize(trigger.dataset.topic);
      const nextTopicLabel = trigger.dataset.topicLabel || trigger.dataset.topic || "";
      const isSameTopic = activeTopic === nextTopic;
      activeTopic = isSameTopic ? "" : nextTopic;
      activeTopicLabel = isSameTopic ? "" : nextTopicLabel;
      updateActiveTopicStyles();
      applyCardFilters();
    });
  });

  if (topicSearchInput) {
    topicSearchInput.addEventListener("input", () => {
      applyTopicVisibility();
    });
  }

  if (cardSearchInput) {
    cardSearchInput.addEventListener("input", () => {
      applyCardFilters();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      activeTopic = "";
      activeTopicLabel = "";
      updateActiveTopicStyles();
      applyCardFilters();
    });
  }

  applyTopicVisibility();
  updateActiveTopicStyles();
  applyCardFilters();
});
