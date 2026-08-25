document.addEventListener("DOMContentLoaded", () => {
  // Load data.json pushed by Google Apps Script automation
  fetch("data.json")
    .then((response) => {
      if (!response.ok) throw new Error("Network response failed");
      return response.json();
    })
    .then((data) => {
      renderHeader(data.lastUpdated);
      renderWeeks(data.weeks);
    })
    .catch((error) => {
      console.error("Error loading homework board data:", error);
      document.getElementById("weeks-container").innerHTML = `
        <div class="loading-state">
          Unable to load homework board. Check back shortly!
        </div>
      `;
    });
});

function renderHeader(lastUpdated) {
  const el = document.getElementById("last-updated");
  if (lastUpdated) {
    el.textContent = `Last updated: ${lastUpdated}`;
  }
}

function renderWeeks(weeks) {
  const container = document.getElementById("weeks-container");
  container.innerHTML = "";

  if (!weeks || weeks.length === 0) {
    container.innerHTML = '<div class="loading-state">No upcoming homework posted.</div>';
    return;
  }

  weeks.forEach((week) => {
    const weekEl = document.createElement("section");
    weekEl.className = "week-section";

    const daysHTML = week.days.map((day) => renderDay(day)).join("");

    weekEl.innerHTML = `
      <div class="week-header">
        <h2 class="week-title">${week.title}</h2>
        <span class="week-badge">${week.weekLabel}</span>
      </div>
      <p class="week-date">${week.dateRange}</p>
      <div class="days-grid">
        ${daysHTML}
      </div>
    `;

    container.appendChild(weekEl);
  });
}

function renderDay(day) {
  let totalItems = 0;
  let groupsHTML = "";

  if (day.subjects && day.subjects.length > 0) {
    day.subjects.forEach((subject) => {
      const tagClass = `tag-${subject.category.toLowerCase()}`;
      
      const itemsHTML = subject.items.map((item) => {
        totalItems++;
        return `
          <div class="assignment-box">
            <div class="assignment-title">${item.title}</div>
            ${item.dueDate ? `<div class="assignment-due">Due: ${item.dueDate}</div>` : ""}
          </div>
        `;
      }).join("");

      groupsHTML += `
        <div class="subject-group">
          <span class="subject-tag ${tagClass}">${subject.category}</span>
          ${itemsHTML}
        </div>
      `;
    });
  } else {
    groupsHTML = `<div class="empty-day">No assignments</div>`;
  }

  return `
    <div class="day-card">
      <div class="day-card-header">
        <span class="day-name">${day.dayName}</span>
        <span class="item-count">${totalItems}</span>
      </div>
      ${groupsHTML}
    </div>
  `;
}