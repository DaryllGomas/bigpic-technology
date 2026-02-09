/**
 * Big Pic Solutions - Invoicing System
 * Frontend JavaScript Application
 */

// ============== APPLICATION STATE ==============

let appState = {
    clients: [],
    jobs: [],
    settings: null,
    goals: null,
    currentEditingClient: null,
    currentEditingJob: null,
    currentInvoiceJob: null,
};

// ============== INITIALIZATION ==============

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize header stars
    initHeaderStars();

    // Load initial data
    loadClients();
    loadJobs();
    loadGoals();
    loadStats();
    loadSettings();

    // Set up navigation
    setupNavigation();

    // Set up modals
    setupModals();

    // Set up form handlers
    setupFormHandlers();

    // Set today's date as default for job form
    document.getElementById('job-date').valueAsDate = new Date();
}

// ============== HEADER STARS ==============

function initHeaderStars() {
    const starsContainer = document.getElementById('header-stars');
    if (!starsContainer) return;

    const starCount = 30;

    for (let i = 0; i < starCount; i++) {
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

            // Deactivate all tabs
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate selected tab
            tab.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// ============== MODALS ==============

function setupModals() {
    // Client modal
    document.getElementById('btn-add-client').addEventListener('click', openClientModal);
    document.getElementById('close-client-modal').addEventListener('click', closeClientModal);
    document.getElementById('cancel-client').addEventListener('click', closeClientModal);

    // Job modal
    document.getElementById('btn-add-job').addEventListener('click', openJobModal);
    document.getElementById('close-job-modal').addEventListener('click', closeJobModal);
    document.getElementById('cancel-job').addEventListener('click', closeJobModal);

    // Invoice modal
    document.getElementById('close-invoice-modal').addEventListener('click', closeInvoiceModal);
    document.getElementById('btn-close-invoice').addEventListener('click', closeInvoiceModal);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const clientModal = document.getElementById('client-modal');
        const jobModal = document.getElementById('job-modal');
        const invoiceModal = document.getElementById('invoice-modal');

        if (e.target === clientModal) clientModal.classList.remove('active');
        if (e.target === jobModal) jobModal.classList.remove('active');
        if (e.target === invoiceModal) invoiceModal.classList.remove('active');
    });
}

function openClientModal() {
    const modal = document.getElementById('client-modal');
    appState.currentEditingClient = null;
    document.getElementById('modal-title').textContent = 'Add New Client';
    document.getElementById('client-form').reset();
    document.getElementById('client-rate').value = '140.00';
    modal.classList.add('active');
}

function closeClientModal() {
    document.getElementById('client-modal').classList.remove('active');
    document.getElementById('client-form').reset();
    appState.currentEditingClient = null;
}

function openJobModal() {
    const modal = document.getElementById('job-modal');
    const clientSelect = document.getElementById('job-client');

    // Populate client dropdown
    clientSelect.innerHTML = '<option value="">-- Select a client --</option>';
    appState.clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });

    appState.currentEditingJob = null;
    document.getElementById('job-modal-title').textContent = 'Add New Job';
    document.getElementById('job-form').reset();
    document.getElementById('job-date').valueAsDate = new Date();
    modal.classList.add('active');
}

function closeJobModal() {
    document.getElementById('job-modal').classList.remove('active');
    document.getElementById('job-form').reset();
    appState.currentEditingJob = null;
}

function openInvoiceModal(jobId) {
    appState.currentInvoiceJob = jobId;
    const modal = document.getElementById('invoice-modal');
    modal.classList.add('active');
    displayInvoice(jobId);
}

function closeInvoiceModal() {
    document.getElementById('invoice-modal').classList.remove('active');
    appState.currentInvoiceJob = null;
}

// ============== FORM HANDLERS ==============

function setupFormHandlers() {
    // Client form
    document.getElementById('client-form').addEventListener('submit', handleClientFormSubmit);

    // Job form
    document.getElementById('job-form').addEventListener('submit', handleJobFormSubmit);

    // Job hours and rate calculators
    document.getElementById('job-hours').addEventListener('input', calculateJobTotal);
    document.getElementById('job-rate').addEventListener('input', calculateJobTotal);
    document.getElementById('job-client').addEventListener('change', updateJobRate);

    // Invoice PDF button
    document.getElementById('btn-pdf-download').addEventListener('click', downloadInvoicePDF);

    // Settings form
    document.getElementById('settings-form').addEventListener('submit', handleSettingsFormSubmit);

    // Export buttons
    document.getElementById('btn-export-clients').addEventListener('click', exportClients);
    document.getElementById('btn-export-jobs').addEventListener('click', exportJobs);
}

// ============== CLIENT FORM ==============

async function handleClientFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        hourly_rate: parseFloat(formData.get('hourly_rate')),
        notes: formData.get('notes'),
    };

    try {
        let response;
        if (appState.currentEditingClient) {
            response = await fetch(`/api/clients/${appState.currentEditingClient}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } else {
            response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        }

        if (response.ok) {
            closeClientModal();
            loadClients();
            showNotification('Client saved successfully!', 'success');
        } else {
            throw new Error('Failed to save client');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error saving client: ' + error.message, 'error');
    }
}

// ============== JOB FORM ==============

async function handleJobFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const clientId = parseInt(formData.get('client_id'));
    const hours = parseFloat(formData.get('hours'));
    let hourlyRate = parseFloat(formData.get('hourly_rate'));

    // If rate is empty, use client's default rate
    if (isNaN(hourlyRate) || hourlyRate === 0) {
        const client = appState.clients.find(c => c.id === clientId);
        hourlyRate = client ? client.hourly_rate : 140.00;
    }

    const data = {
        client_id: clientId,
        job_date: formData.get('job_date'),
        description: formData.get('description'),
        hours: hours,
        hourly_rate: hourlyRate,
        notes: formData.get('notes'),
    };

    try {
        let response;
        if (appState.currentEditingJob) {
            response = await fetch(`/api/jobs/${appState.currentEditingJob}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } else {
            response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        }

        if (response.ok) {
            closeJobModal();
            loadJobs();
            loadStats();
            showNotification('Job saved successfully!', 'success');
        } else {
            throw new Error('Failed to save job');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error saving job: ' + error.message, 'error');
    }
}

function calculateJobTotal() {
    const hours = parseFloat(document.getElementById('job-hours').value) || 0;
    const rate = parseFloat(document.getElementById('job-rate').value) || 0;
    const total = hours * rate;

    document.getElementById('job-total').textContent = '$' + total.toFixed(2);
}

function updateJobRate() {
    const clientId = parseInt(document.getElementById('job-client').value);
    const client = appState.clients.find(c => c.id === clientId);

    if (client) {
        document.getElementById('job-rate').value = client.hourly_rate.toFixed(2);
        calculateJobTotal();
    }
}

// ============== CLIENT MANAGEMENT ==============

async function loadClients() {
    try {
        const response = await fetch('/api/clients');
        appState.clients = await response.json();
        renderClients();
    } catch (error) {
        console.error('Error loading clients:', error);
        showNotification('Error loading clients', 'error');
    }
}

function renderClients() {
    const container = document.getElementById('clients-list');

    if (appState.clients.length === 0) {
        container.innerHTML = '<p class="empty-state">No clients yet</p>';
        return;
    }

    container.innerHTML = appState.clients.map(client => `
        <div class="client-card">
            <div class="client-name">${escapeHtml(client.name)}</div>
            ${client.email ? `<div class="client-info"><strong>Email:</strong> ${escapeHtml(client.email)}</div>` : ''}
            ${client.phone ? `<div class="client-info"><strong>Phone:</strong> ${escapeHtml(client.phone)}</div>` : ''}
            ${client.address ? `<div class="client-info"><strong>Address:</strong> ${escapeHtml(client.address)}</div>` : ''}
            <div class="client-rate">Rate: $${client.hourly_rate.toFixed(2)}/hour</div>
            ${client.notes ? `<div class="client-info"><strong>Notes:</strong> ${escapeHtml(client.notes)}</div>` : ''}
            <div class="client-actions">
                <button class="btn btn-primary btn-small" onclick="editClient(${client.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteClient(${client.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function editClient(clientId) {
    const client = appState.clients.find(c => c.id === clientId);
    if (!client) return;

    appState.currentEditingClient = clientId;
    document.getElementById('modal-title').textContent = 'Edit Client';
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-phone').value = client.phone || '';
    document.getElementById('client-address').value = client.address || '';
    document.getElementById('client-rate').value = client.hourly_rate.toFixed(2);
    document.getElementById('client-notes').value = client.notes || '';

    document.getElementById('client-modal').classList.add('active');
}

async function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client? This will not delete their jobs.')) {
        return;
    }

    try {
        const response = await fetch(`/api/clients/${clientId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadClients();
            showNotification('Client deleted', 'success');
        } else {
            throw new Error('Failed to delete client');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting client: ' + error.message, 'error');
    }
}

// ============== JOB MANAGEMENT ==============

async function loadJobs() {
    try {
        const response = await fetch('/api/jobs');
        appState.jobs = await response.json();
        renderJobs();
        renderRecentJobs();
    } catch (error) {
        console.error('Error loading jobs:', error);
        showNotification('Error loading jobs', 'error');
    }
}

function renderJobs() {
    const container = document.getElementById('jobs-list');

    if (appState.jobs.length === 0) {
        container.innerHTML = '<p class="empty-state">No jobs yet</p>';
        return;
    }

    container.innerHTML = appState.jobs.map(job => {
        const invoiceNumber = job.invoice_number ? `INV-${String(job.invoice_number).padStart(4, '0')}` : 'Not assigned';
        const invoiceStatus = job.invoice_status || 'draft';
        const statusClass = `invoice-status-${invoiceStatus}`;
        const statusLabel = invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1);

        // Build status action buttons based on current status
        let statusActions = '';
        if (invoiceStatus === 'draft') {
            statusActions = `<button class="btn btn-small btn-status-sent" onclick="updateInvoiceStatus(${job.id}, 'sent')">Mark Sent</button>`;
        } else if (invoiceStatus === 'sent') {
            statusActions = `
                <button class="btn btn-small btn-status-revert" onclick="updateInvoiceStatus(${job.id}, 'draft')">↩ Draft</button>
                <button class="btn btn-small btn-status-paid" onclick="updateInvoiceStatus(${job.id}, 'paid')">Mark Paid</button>`;
        } else if (invoiceStatus === 'paid') {
            statusActions = `<button class="btn btn-small btn-status-revert" onclick="updateInvoiceStatus(${job.id}, 'sent')">↩ Unmark Paid</button>`;
        }

        return `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <div class="job-client">${escapeHtml(job.client_name)}</div>
                    <div class="job-title">${escapeHtml(job.description.substring(0, 60))}</div>
                </div>
                <div class="job-meta">
                    <div class="job-date">${new Date(job.job_date).toLocaleDateString()}</div>
                    <div class="invoice-badge ${statusClass}">${statusLabel}</div>
                </div>
            </div>
            <div class="job-invoice-info">
                <span class="invoice-number">${invoiceNumber}</span>
                ${job.invoice_sent_date ? `<span class="invoice-date">Sent: ${new Date(job.invoice_sent_date).toLocaleDateString()}</span>` : ''}
                ${job.invoice_paid_date ? `<span class="invoice-date">Paid: ${new Date(job.invoice_paid_date).toLocaleDateString()}</span>` : ''}
            </div>
            <div class="job-description">${escapeHtml(job.description)}</div>
            ${job.notes ? `<div class="job-description"><strong>Notes:</strong> ${escapeHtml(job.notes)}</div>` : ''}
            <div class="job-details">
                <div class="job-detail-item">
                    <div class="job-detail-label">Hours</div>
                    <div class="job-detail-value">${job.hours.toFixed(2)}</div>
                </div>
                <div class="job-detail-item">
                    <div class="job-detail-label">Rate</div>
                    <div class="job-detail-value">$${job.hourly_rate.toFixed(2)}</div>
                </div>
                <div class="job-detail-item">
                    <div class="job-detail-label">Total</div>
                    <div class="job-detail-value">$${job.total.toFixed(2)}</div>
                </div>
            </div>
            <div class="job-actions">
                ${statusActions}
                <button class="btn btn-primary btn-small" onclick="openInvoiceModal(${job.id})">View Invoice</button>
                <button class="btn btn-primary btn-small" onclick="editJob(${job.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteJob(${job.id})">Delete</button>
            </div>
        </div>
    `}).join('');
}

async function updateInvoiceStatus(jobId, newStatus) {
    try {
        const response = await fetch(`/api/jobs/${jobId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoice_status: newStatus }),
        });

        if (response.ok) {
            const result = await response.json();
            loadJobs();
            showNotification(`Invoice marked as ${newStatus}`, 'success');
        } else {
            throw new Error('Failed to update invoice status');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error updating invoice status: ' + error.message, 'error');
    }
}

function renderRecentJobs() {
    const container = document.getElementById('recent-jobs-list');
    const recentJobs = appState.jobs.slice(0, 5);

    if (recentJobs.length === 0) {
        container.innerHTML = '<p class="empty-state">No jobs yet</p>';
        return;
    }

    container.innerHTML = recentJobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <div class="job-client">${escapeHtml(job.client_name)}</div>
                    <div class="job-title">${escapeHtml(job.description.substring(0, 60))}</div>
                </div>
                <div class="job-date">${new Date(job.job_date).toLocaleDateString()}</div>
            </div>
            <div class="job-details">
                <div class="job-detail-item">
                    <div class="job-detail-label">Hours</div>
                    <div class="job-detail-value">${job.hours.toFixed(2)}</div>
                </div>
                <div class="job-detail-item">
                    <div class="job-detail-label">Total</div>
                    <div class="job-detail-value">$${job.total.toFixed(2)}</div>
                </div>
                <div class="job-detail-item">
                    <button class="btn btn-primary btn-small" onclick="openInvoiceModal(${job.id})">📄 View</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editJob(jobId) {
    const job = appState.jobs.find(j => j.id === jobId);
    if (!job) return;

    appState.currentEditingJob = jobId;
    document.getElementById('job-modal-title').textContent = 'Edit Job';

    const clientSelect = document.getElementById('job-client');
    clientSelect.innerHTML = '';
    appState.clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });

    document.getElementById('job-client').value = job.client_id;
    document.getElementById('job-date').value = job.job_date;
    document.getElementById('job-description').value = job.description;
    document.getElementById('job-hours').value = job.hours;
    document.getElementById('job-rate').value = job.hourly_rate.toFixed(2);
    document.getElementById('job-notes').value = job.notes || '';

    calculateJobTotal();
    document.getElementById('job-modal').classList.add('active');
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) {
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadJobs();
            loadStats();
            showNotification('Job deleted', 'success');
        } else {
            throw new Error('Failed to delete job');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting job: ' + error.message, 'error');
    }
}

// ============== INVOICE DISPLAY ==============

async function displayInvoice(jobId) {
    try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const job = await response.json();

        // Get company settings for invoice header
        const settings = appState.settings || {
            company_name: 'Big Pic Solutions',
            owner_name: 'Daryll Gomas',
            address: '4116 SE 79th Ave, Portland, Oregon 97206',
            phone: '727-475-4153',
            email: 'daryll.gomas@gmail.com'
        };

        const invoiceNumber = job.invoice_number ? `INV-${String(job.invoice_number).padStart(4, '0')}` : 'Pending';
        const invoiceStatus = job.invoice_status || 'draft';
        const statusLabel = invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1);

        const content = `
            <div class="invoice-preview-header">
                <div class="invoice-company">
                    <h1>${escapeHtml(settings.company_name)}</h1>
                    <div class="invoice-company-details">
                        ${escapeHtml(settings.owner_name)}<br>
                        ${escapeHtml(settings.address)}<br>
                        ${escapeHtml(settings.phone)} &bull; ${escapeHtml(settings.email)}
                    </div>
                </div>
                <div class="invoice-title-block">
                    <h2 class="invoice-title">INVOICE</h2>
                    <div class="invoice-status-badge invoice-status-${invoiceStatus}">${statusLabel}</div>
                </div>
            </div>

            <div class="invoice-details-grid">
                <div class="invoice-details-box">
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Invoice #:</span>
                        <span class="invoice-detail-value">${invoiceNumber}</span>
                    </div>
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Date:</span>
                        <span class="invoice-detail-value">${new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Service Date:</span>
                        <span class="invoice-detail-value">${new Date(job.job_date).toLocaleDateString()}</span>
                    </div>
                    ${job.invoice_sent_date ? `
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Sent:</span>
                        <span class="invoice-detail-value">${new Date(job.invoice_sent_date).toLocaleDateString()}</span>
                    </div>` : ''}
                    ${job.invoice_paid_date ? `
                    <div class="invoice-detail-row">
                        <span class="invoice-detail-label">Paid:</span>
                        <span class="invoice-detail-value">${new Date(job.invoice_paid_date).toLocaleDateString()}</span>
                    </div>` : ''}
                </div>
                <div class="invoice-bill-to">
                    <h3>Bill To</h3>
                    <div class="invoice-client-info">
                        ${escapeHtml(job.client_name)}<br>
                        ${job.client_address ? escapeHtml(job.client_address) + '<br>' : ''}
                        ${job.client_email || ''}<br>
                        ${job.client_phone || ''}
                    </div>
                </div>
            </div>

            <div class="invoice-services">
                <h3>Services</h3>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Description</th>
                            <th style="text-align: right;">Hours</th>
                            <th style="text-align: right;">Rate</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${escapeHtml(job.description)}</td>
                            <td style="text-align: right;">${job.hours.toFixed(2)}</td>
                            <td style="text-align: right;">$${job.hourly_rate.toFixed(2)}/hr</td>
                            <td style="text-align: right;">$${job.total.toFixed(2)}</td>
                        </tr>
                        ${job.notes ? `<tr class="invoice-notes-row"><td colspan="4"><em>Note: ${escapeHtml(job.notes)}</em></td></tr>` : ''}
                    </tbody>
                </table>
            </div>

            <div class="invoice-totals">
                <div class="invoice-totals-row">
                    <span>Subtotal:</span>
                    <span>$${job.total.toFixed(2)}</span>
                </div>
                <div class="invoice-totals-row">
                    <span>Tax (0%):</span>
                    <span>$0.00</span>
                </div>
                <div class="invoice-totals-row invoice-total-final">
                    <span>Total Due:</span>
                    <span>$${job.total.toFixed(2)}</span>
                </div>
            </div>

            <div class="invoice-footer">
                Thank you for your business!<br>
                <span>${escapeHtml(settings.company_name)} &bull; AI-Powered Technology Consulting</span>
            </div>
        `;

        document.getElementById('invoice-content').innerHTML = content;
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading invoice: ' + error.message, 'error');
    }
}

function downloadInvoicePDF() {
    const jobId = appState.currentInvoiceJob;
    if (!jobId) return;

    // Find the job to get the invoice number
    const job = appState.jobs.find(j => j.id === jobId);
    const invoiceNumber = job && job.invoice_number ? `INV-${String(job.invoice_number).padStart(4, '0')}` : `JOB-${jobId}`;

    const link = document.createElement('a');
    link.href = `/api/jobs/${jobId}/pdf`;
    link.download = `Invoice-${invoiceNumber}.pdf`;
    link.click();

    showNotification('PDF downloaded!', 'success');
}

// ============== STATISTICS ==============

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        document.getElementById('stat-revenue').textContent = '$' + stats.total_revenue.toFixed(2);
        document.getElementById('stat-hours').textContent = stats.total_hours.toFixed(1) + ' hrs';
        document.getElementById('stat-clients').textContent = stats.total_clients;
        document.getElementById('stat-jobs').textContent = stats.total_jobs;

        // Update goals progress if goals are loaded
        if (appState.goals) {
            updateGoalsProgress(stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadGoals() {
    try {
        const response = await fetch('/api/goals');
        appState.goals = await response.json();
        renderGoals();
    } catch (error) {
        console.error('Error loading goals:', error);
    }
}

function renderGoals() {
    if (!appState.goals) return;

    const goals = appState.goals;

    // Update goal amounts
    document.getElementById('goal-yearly').textContent = '$' + goals.yearly_gross.toLocaleString();
    document.getElementById('goal-monthly').textContent = '$' + goals.monthly_gross.toLocaleString();
    document.getElementById('goal-weekly').textContent = '$' + goals.weekly_gross.toLocaleString();
    document.getElementById('goal-daily').textContent = '$' + goals.daily_gross.toFixed(0);
    document.getElementById('goal-net').textContent = '$' + goals.yearly_net.toLocaleString() + '/year';
}

function updateGoalsProgress(stats) {
    if (!appState.goals) return;

    const goals = appState.goals;

    // Yearly progress
    const yearlyPercent = Math.min((stats.year_revenue / goals.yearly_gross) * 100, 100);
    document.getElementById('progress-yearly').style.width = yearlyPercent + '%';
    document.getElementById('progress-yearly-amount').textContent = '$' + stats.year_revenue.toFixed(0);
    document.getElementById('progress-yearly-percent').textContent = yearlyPercent.toFixed(1) + '%';

    // Monthly progress
    const monthlyPercent = Math.min((stats.month_revenue / goals.monthly_gross) * 100, 100);
    document.getElementById('progress-monthly').style.width = monthlyPercent + '%';
    document.getElementById('progress-monthly-amount').textContent = '$' + stats.month_revenue.toFixed(0);
    document.getElementById('progress-monthly-percent').textContent = monthlyPercent.toFixed(1) + '%';

    // Weekly progress
    const weeklyPercent = Math.min((stats.week_revenue / goals.weekly_gross) * 100, 100);
    document.getElementById('progress-weekly').style.width = weeklyPercent + '%';
    document.getElementById('progress-weekly-amount').textContent = '$' + stats.week_revenue.toFixed(0);
    document.getElementById('progress-weekly-percent').textContent = weeklyPercent.toFixed(1) + '%';
}

// ============== COMPANY SETTINGS ==============

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        appState.settings = await response.json();
        renderSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Error loading settings', 'error');
    }
}

function renderSettings() {
    if (!appState.settings) return;

    document.getElementById('settings-company').value = appState.settings.company_name || '';
    document.getElementById('settings-owner').value = appState.settings.owner_name || '';
    document.getElementById('settings-address').value = appState.settings.address || '';
    document.getElementById('settings-phone').value = appState.settings.phone || '';
    document.getElementById('settings-email').value = appState.settings.email || '';
    document.getElementById('settings-rate').value = appState.settings.default_hourly_rate?.toFixed(2) || '140.00';
}

async function handleSettingsFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        company_name: formData.get('company_name'),
        owner_name: formData.get('owner_name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        default_hourly_rate: parseFloat(formData.get('default_hourly_rate')),
    };

    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            loadSettings();
            showNotification('Settings saved successfully!', 'success');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error saving settings: ' + error.message, 'error');
    }
}

// ============== UTILITIES ==============

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

function showNotification(message, type = 'info') {
    // Simple notification - in production, use a proper toast library
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Create a simple toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#ff1744' : type === 'success' ? '#00ff88' : '#00d4ff'};
        color: #0a0a0a;
        border-radius: 4px;
        z-index: 2000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============== DATA EXPORT ==============

function exportClients() {
    window.location.href = '/api/export/clients';
    showNotification('Downloading clients CSV...', 'success');
}

function exportJobs() {
    window.location.href = '/api/export/jobs';
    showNotification('Downloading jobs CSV...', 'success');
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
