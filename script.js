let rawAssignments = [];
let activeBlock = '1st Block';

function displayCurrentDate() {
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', options);
  document.getElementById('today-date').innerText = `📅 Today is ${today}`;
}

async function loadHomework() {
  displayCurrentDate();
  try {
    const response = await fetch('data.json?cacheBust=' + new Date().getTime());
    rawAssignments = await response.json();
    renderBoard();
  } catch (err) {
    console.error("Failed to load homework data:", err);
  }
}

function switchBlock(blockName) {
  activeBlock = blockName;
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.innerText.includes(blockName.replace(' Block', ''));
    btn.classList.toggle('active', isActive);
  });
  
  renderBoard();
}

function renderBoard() {
  // Clear previous column data
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`list-${i}`).innerHTML = '';
    document.getElementById(`count-${i}`).innerText = '0';
  }

  // Filter items matching selected block
  const blockData = rawAssignments.filter(item => {
    if (!item.courseName) return true;
    const blockNum = activeBlock.replace(' Block', '');
    return item.courseName.toLowerCase().includes(blockNum.toLowerCase()) ||
           item.courseName.toLowerCase().includes(activeBlock.toLowerCase());
  });

  const dayCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  blockData.forEach(item => {
    // Default to Monday (1) if no day or weekend due date
    let dayIdx = item.dayOfWeek;
    if (!dayIdx || dayIdx < 1 || dayIdx > 5) dayIdx = 1; 

    const listEl = document.getElementById(`list-${dayIdx}`);
    if (listEl) {
      dayCounts[dayIdx]++;
      
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <span class="item-tag">${item.category || 'General'}</span>
        <h4 class="item-title">${item.title}</h4>
        <span class="item-due">Due: ${item.dueDate}</span>
      `;
      listEl.appendChild(card);
    }
  });

  // Update badge counters
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`count-${i}`).innerText = dayCounts[i];
  }
}

window.onload = loadHomework;
