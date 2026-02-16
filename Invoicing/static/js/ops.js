/**
 * Big Pic Solutions - Operations Dashboard
 * Pipeline, Scorecard, and Time Tracking
 */

// ============== APPLICATION STATE ==============

let opsState = {
    leads: [],
    scorecard: null,
    clients: [],
    currentEditingLead: null,
    currentFilter: 'all',
    timer: {
        running: false,
        startTime: null,
        interval: null,
        elapsed: 0
    }
};

// ============== INITIALIZATION ==============

document.addEventListener('DOMContentLoaded', () => {
    initOpsApp();
});

function initOpsApp() {
    initHeaderStars();
    setupNavigation();
    loadScorecard();
    loadLeads();
    loadClients();
    setupLeadModal();
    setupDailyLogModal();
    setupPipelineFilters();
    setupTimer();
    restoreTimerState();
}

// ============== HEADER STARS ==============

function initHeaderStars() {
    const starsContainer = document.getElementById('header-stars');
    if (!starsContainer) return;
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'header-star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
        star.style.setProperty('--delay', `${Math.random() * 3}s`);
        starsContainer.appendChild(star);
    }
}

// ============== NAVIGATION ==============

function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// ============== SCORECARD ==============

async function loadScorecard() {
    try {
        const response = await fetch('/api/scorecard');
        opsState.scorecard = await response.json();
        renderScorecard();
    } catch (error) {
        console.error('Error loading scorecard:', error);
    }
}

function renderScorecard() {
    const sc = opsState.scorecard;
    if (!sc) return;

    document.getElementById('sc-week-revenue').textContent = '$' + sc.week_revenue.toFixed(0);
    document.getElementById('sc-month-revenue').textContent = '$' + sc.month_revenue.toFixed(0);
    document.getElementById('sc-month-hours').textContent = sc.month_hours.toFixed(1) + ' hrs';
    document.getElementById('sc-pipeline-value').textContent = '$' + sc.pipeline_value.toLocaleString();
    document.getElementById('sc-active-leads').textContent = sc.active_leads;
    document.getElementById('sc-followups-due').textContent = sc.followups_due;
    document.getElementById('sc-year-revenue').textContent = '$' + sc.year_revenue.toFixed(0);

    // Progress bars
    const weekPct = Math.min((sc.week_revenue / sc.week_target) * 100, 100);
    const monthPct = Math.min((sc.month_revenue / sc.month_target) * 100, 100);
    document.getElementById('sc-week-progress').style.width = weekPct + '%';
    document.getElementById('sc-month-progress').style.width = monthPct + '%';

    // Highlight follow-ups if any are due
    const followupsEl = document.getElementById('sc-followups-due');
    if (sc.followups_due > 0) {
        followupsEl.classList.add('has-alerts');
    } else {
        followupsEl.classList.remove('has-alerts');
    }

    // Render daily logs
    renderDailyLogs(sc.daily_scores || []);
}

function renderDailyLogs(scores) {
    const container = document.getElementById('daily-log-list');
    if (scores.length === 0) {
        container.innerHTML = '<p class="empty-state">No daily logs yet - click "Log Today" to start tracking</p>';
        return;
    }

    container.innerHTML = scores.reverse().slice(0, 14).map(s => `
        <div class="job-card">
            <div class="job-header">
                <div class="job-client">${new Date(s.score_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div class="job-date">${s.outreach_count} outreach</div>
            </div>
            <div class="job-details">
                <div class="job-detail-item">
                    <div class="job-detail-label">Hours</div>
                    <div class="job-detail-value">${s.hours_billed.toFixed(1)}</div>
                </div>
                <div class="job-detail-item">
                    <div class="job-detail-label">Outreach</div>
                    <div class="job-detail-value">${s.outreach_count}</div>
                </div>
            </div>
            ${s.notes ? `<div class="job-description">${escapeHtml(s.notes)}</div>` : ''}
        </div>
    `).join('');
}

// ============== DAILY LOG MODAL ==============

function setupDailyLogModal() {
    document.getElementById('btn-log-today').addEventListener('click', () => {
        document.getElementById('log-date').valueAsDate = new Date();
        document.getElementById('daily-log-modal').classList.add('active');
    });
    document.getElementById('close-daily-log-modal').addEventListener('click', closeDailyLogModal);
    document.getElementById('cancel-daily-log').addEventListener('click', closeDailyLogModal);
    document.getElementById('daily-log-form').addEventListener('submit', handleDailyLogSubmit);
}

function closeDailyLogModal() {
    document.getElementById('daily-log-modal').classList.remove('active');
    document.getElementById('daily-log-form').reset();
}

async function handleDailyLogSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        score_date: formData.get('score_date'),
        hours_billed: parseFloat(formData.get('hours_billed')) || 0,
        outreach_count: parseInt(formData.get('outreach_count')) || 0,
        notes: formData.get('notes')
    };

    try {
        const response = await fetch('/api/scorecard/daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            closeDailyLogModal();
            loadScorecard();
            showNotification('Daily log saved!', 'success');
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        showNotification('Error saving daily log: ' + error.message, 'error');
    }
}

// ============== PIPELINE / LEADS ==============

async function loadLeads() {
    try {
        const response = await fetch('/api/leads');
        opsState.leads = await response.json();
        renderLeads();
    } catch (error) {
        console.error('Error loading leads:', error);
    }
}

function renderLeads() {
    const container = document.getElementById('leads-list');
    let leads = opsState.leads;

    if (opsState.currentFilter !== 'all') {
        leads = leads.filter(l => l.status === opsState.currentFilter);
    }

    if (leads.length === 0) {
        container.innerHTML = '<p class="empty-state">No leads yet - start your outreach!</p>';
        return;
    }

    container.innerHTML = leads.map(lead => {
        const statusClass = `lead-status-${lead.status}`;
        const statusLabel = lead.status.charAt(0).toUpperCase() + lead.status.slice(1);
        const isOverdue = lead.next_followup && new Date(lead.next_followup + 'T23:59:59') < new Date();
        const followupClass = isOverdue ? 'followup-overdue' : '';

        return `
        <div class="lead-card ${statusClass}">
            <div class="lead-header">
                <div>
                    <div class="lead-name">${escapeHtml(lead.name)}</div>
                    ${lead.company ? `<div class="lead-company">${escapeHtml(lead.company)}</div>` : ''}
                </div>
                <div class="lead-meta">
                    <span class="invoice-badge ${statusClass}">${statusLabel}</span>
                </div>
            </div>
            <div class="lead-info-row">
                ${lead.email ? `<span>${escapeHtml(lead.email)}</span>` : ''}
                ${lead.phone ? `<span>${escapeHtml(lead.phone)}</span>` : ''}
                ${lead.source ? `<span class="lead-source">${escapeHtml(lead.source)}</span>` : ''}
            </div>
            ${lead.pipeline_value > 0 ? `<div class="lead-value">Pipeline: $${lead.pipeline_value.toLocaleString()}</div>` : ''}
            ${lead.next_followup ? `<div class="lead-followup ${followupClass}">Follow-up: ${new Date(lead.next_followup + 'T12:00:00').toLocaleDateString()}</div>` : ''}
            ${lead.notes ? `<div class="job-description">${escapeHtml(lead.notes)}</div>` : ''}
            <div class="job-actions">
                <button class="btn btn-primary btn-small" onclick="editLead(${lead.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteLead(${lead.id})">Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

function setupPipelineFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            opsState.currentFilter = btn.getAttribute('data-filter');
            renderLeads();
        });
    });
}

// ============== LEAD MODAL ==============

function setupLeadModal() {
    document.getElementById('btn-add-lead').addEventListener('click', openLeadModal);
    document.getElementById('close-lead-modal').addEventListener('click', closeLeadModal);
    document.getElementById('cancel-lead').addEventListener('click', closeLeadModal);
    document.getElementById('lead-form').addEventListener('submit', handleLeadFormSubmit);
}

function openLeadModal() {
    opsState.currentEditingLead = null;
    document.getElementById('lead-modal-title').textContent = 'Add New Lead';
    document.getElementById('lead-form').reset();
    document.getElementById('lead-modal').classList.add('active');
}

function closeLeadModal() {
    document.getElementById('lead-modal').classList.remove('active');
    document.getElementById('lead-form').reset();
    opsState.currentEditingLead = null;
}

function editLead(leadId) {
    const lead = opsState.leads.find(l => l.id === leadId);
    if (!lead) return;

    opsState.currentEditingLead = leadId;
    document.getElementById('lead-modal-title').textContent = 'Edit Lead';
    document.getElementById('lead-name').value = lead.name;
    document.getElementById('lead-company').value = lead.company || '';
    document.getElementById('lead-email').value = lead.email || '';
    document.getElementById('lead-phone').value = lead.phone || '';
    document.getElementById('lead-source').value = lead.source || '';
    document.getElementById('lead-status').value = lead.status || 'prospect';
    document.getElementById('lead-value').value = lead.pipeline_value || 0;
    document.getElementById('lead-next-followup').value = lead.next_followup || '';
    document.getElementById('lead-notes').value = lead.notes || '';

    document.getElementById('lead-modal').classList.add('active');
}

async function handleLeadFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        source: formData.get('source'),
        status: formData.get('status'),
        pipeline_value: parseFloat(formData.get('pipeline_value')) || 0,
        next_followup: formData.get('next_followup') || null,
        notes: formData.get('notes'),
        last_contact: new Date().toISOString().split('T')[0]
    };

    try {
        let response;
        if (opsState.currentEditingLead) {
            response = await fetch(`/api/leads/${opsState.currentEditingLead}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            closeLeadModal();
            loadLeads();
            loadScorecard();
            showNotification('Lead saved!', 'success');
        } else {
            throw new Error('Failed to save lead');
        }
    } catch (error) {
        showNotification('Error saving lead: ' + error.message, 'error');
    }
}

async function deleteLead(leadId) {
    if (!confirm('Delete this lead?')) return;

    try {
        const response = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
        if (response.ok) {
            loadLeads();
            loadScorecard();
            showNotification('Lead deleted', 'success');
        } else {
            throw new Error('Failed to delete');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ============== TIME TRACKER ==============

async function loadClients() {
    try {
        const response = await fetch('/api/clients');
        opsState.clients = await response.json();
        populateTimerClients();
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

function populateTimerClients() {
    const select = document.getElementById('timer-client');
    select.innerHTML = '<option value="">-- Select a client --</option>';
    opsState.clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

function setupTimer() {
    document.getElementById('btn-timer-start').addEventListener('click', startTimer);
    document.getElementById('btn-timer-stop').addEventListener('click', stopTimer);
}

function startTimer() {
    const clientId = document.getElementById('timer-client').value;
    const description = document.getElementById('timer-description').value;

    if (!clientId) {
        showNotification('Please select a client first', 'error');
        return;
    }

    opsState.timer.running = true;
    opsState.timer.startTime = Date.now();
    opsState.timer.elapsed = 0;

    // Save to localStorage so it persists across page refreshes
    localStorage.setItem('bps_timer', JSON.stringify({
        running: true,
        startTime: opsState.timer.startTime,
        clientId: clientId,
        description: description
    }));

    document.getElementById('btn-timer-start').style.display = 'none';
    document.getElementById('btn-timer-stop').style.display = '';
    document.getElementById('timer-status').textContent = 'Running...';
    document.getElementById('timer-client').disabled = true;
    document.getElementById('timer-description').disabled = true;

    opsState.timer.interval = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
    if (!opsState.timer.running) return;

    clearInterval(opsState.timer.interval);
    opsState.timer.running = false;

    const elapsed = Date.now() - opsState.timer.startTime;
    const hours = elapsed / (1000 * 60 * 60);

    const clientId = document.getElementById('timer-client').value;
    const description = document.getElementById('timer-description').value;
    const client = opsState.clients.find(c => c.id === parseInt(clientId));

    localStorage.removeItem('bps_timer');

    document.getElementById('btn-timer-start').style.display = '';
    document.getElementById('btn-timer-stop').style.display = 'none';
    document.getElementById('timer-status').textContent = 'Stopped - ' + formatDuration(elapsed);
    document.getElementById('timer-client').disabled = false;
    document.getElementById('timer-description').disabled = false;

    // Auto-create a job entry
    if (hours >= 0.01 && clientId) {
        createJobFromTimer(clientId, description, hours, client ? client.hourly_rate : 140);
    }
}

async function createJobFromTimer(clientId, description, hours, rate) {
    const roundedHours = Math.round(hours * 4) / 4; // Round to nearest 15 min
    const data = {
        client_id: parseInt(clientId),
        job_date: new Date().toISOString().split('T')[0],
        description: description || 'Timed session',
        hours: roundedHours,
        hourly_rate: rate,
        notes: `Auto-logged from timer (${formatDuration(hours * 3600000)} actual)`
    };

    try {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification(`Job created: ${roundedHours.toFixed(2)} hrs @ $${rate}/hr = $${(roundedHours * rate).toFixed(2)}`, 'success');
            loadScorecard();
            loadTodaySessions();
        } else {
            throw new Error('Failed to create job');
        }
    } catch (error) {
        showNotification('Error creating job: ' + error.message, 'error');
    }
}

function updateTimerDisplay() {
    if (!opsState.timer.running) return;
    const elapsed = Date.now() - opsState.timer.startTime;
    document.getElementById('timer-clock').textContent = formatDuration(elapsed);
}

function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function restoreTimerState() {
    const saved = localStorage.getItem('bps_timer');
    if (!saved) {
        loadTodaySessions();
        return;
    }

    try {
        const data = JSON.parse(saved);
        if (data.running) {
            opsState.timer.running = true;
            opsState.timer.startTime = data.startTime;

            document.getElementById('timer-client').value = data.clientId || '';
            document.getElementById('timer-description').value = data.description || '';
            document.getElementById('btn-timer-start').style.display = 'none';
            document.getElementById('btn-timer-stop').style.display = '';
            document.getElementById('timer-status').textContent = 'Running...';
            document.getElementById('timer-client').disabled = true;
            document.getElementById('timer-description').disabled = true;

            opsState.timer.interval = setInterval(updateTimerDisplay, 1000);
            updateTimerDisplay();
        }
    } catch (e) {
        localStorage.removeItem('bps_timer');
    }

    loadTodaySessions();
}

async function loadTodaySessions() {
    try {
        const response = await fetch('/api/jobs');
        const jobs = await response.json();
        const today = new Date().toISOString().split('T')[0];
        const todayJobs = jobs.filter(j => j.job_date === today);

        const container = document.getElementById('timer-sessions');
        if (todayJobs.length === 0) {
            container.innerHTML = '<p class="empty-state">No sessions today</p>';
            return;
        }

        container.innerHTML = todayJobs.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <div class="job-client">${escapeHtml(job.client_name)}</div>
                    <div class="job-detail-value highlight">$${job.total.toFixed(2)}</div>
                </div>
                <div class="job-description">${escapeHtml(job.description)}</div>
                <div class="job-details">
                    <div class="job-detail-item">
                        <div class="job-detail-label">Hours</div>
                        <div class="job-detail-value">${job.hours.toFixed(2)}</div>
                    </div>
                    <div class="job-detail-item">
                        <div class="job-detail-label">Rate</div>
                        <div class="job-detail-value">$${job.hourly_rate.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading today sessions:', error);
    }
}

// ============== UTILITIES ==============

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#ff1744' : type === 'success' ? '#00ff88' : '#00d4ff'};
        color: #0a0a0a; border-radius: 4px; z-index: 2000; font-weight: 500;
        animation: slideIn 0.3s ease; font-family: var(--font-display);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(style);
