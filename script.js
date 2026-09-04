let rawAssignments = [];
let activeBlock = 'Block 1';

// Render current date in header
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
    document.getElementById('board').innerHTML = 
      '<div class="empty-state">Unable to load assignments right now.</div>';
  }
}

function switchBlock(blockName) {
  activeBlock = blockName;
  
  // Toggle active button states
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.innerText.includes(blockName.replace('Block ', ''));
    btn.classList.toggle('active', isActive);
  });
  
  renderBoard();
}

function getTagClass(topic) {
  if (!topic) return 'tag-intro';
  const t = topic.toLowerCase();
  
  if (t.includes('grammar') || t.includes('spelling')) return 'tag-grammar';
  if (t.includes('unit') || t.includes('essay') || t.includes('hunger') || t.includes('carol') || t.includes('franklin')) return 'tag-unit';
  if (t.includes('idr')) return 'tag-idr';
  if (t.includes('reference')) return 'tag-docs';
  return 'tag-intro';
}

// Clean date parser to prevent UTC off-by-one shifts
function formatDueDate(rawDate) {
  if (!rawDate) return 'No Due Date';
  
  // If date string is formatted like "2026-09-09" or "9/9/2026"
  if (typeof rawDate === 'string' && rawDate.includes('-')) {
    const parts = rawDate.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[1])}/${parseInt(parts[2])}/${parts[0]}`;
    }
  }
  return rawDate;
}

function renderBoard() {
  const container = document.getElementById('board');
  
  const blockData = rawAssignments.filter(item => {
    if (!item.courseName) return true;
    return item.courseName.toLowerCase().includes(activeBlock.toLowerCase()) || 
           item.courseName.toLowerCase().includes(activeBlock.replace('Block ', '').toLowerCase());
  });

  if (blockData.length === 0) {
    container.innerHTML = `<div class="empty-state">No upcoming assignments found for ${activeBlock}.</div>`;
    return;
  }

  container.innerHTML = blockData.map(item => `
    <div class="card">
      <div class="card-header">
        <span class="tag ${getTagClass(item.topic || item.category)}">
          ${item.topic || item.category || 'General'}
        </span>
        <span class="due-date">Due: ${formatDueDate(item.dueDate)}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.description || ''}</p>
    </div>
  `).join('');
}

window.onload = loadHomework;