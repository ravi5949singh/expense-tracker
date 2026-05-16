
// AI Summary Button
const generateSummaryBtn = document.getElementById('generate-summary-btn');
if(generateSummaryBtn) {
    generateSummaryBtn.addEventListener('click', async () => {
        showToast("Generating Monthly Summary...");
        try {
            const res = await apiFetch('/api/ai/summary', {
                method: 'POST',
                body: JSON.stringify({ expenses })
            });
            const data = await res.json();
            
            // Append to chat history
            const div = document.createElement('div');
            div.className = 'chat-message bot-message glass-panel';
            div.style.padding = '15px';
            div.style.marginTop = '10px';
            div.innerHTML = `<strong style="color:var(--primary-color);"><i class='bx bx-bar-chart-alt-2'></i> Monthly Summary</strong><br>` + data.result.replace(/\n/g, '<br>');
            aiChatHistory.appendChild(div);
            aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
        } catch(err) {
            showToast("Failed to generate summary.");
        }
    });
}
// ===============================
// DOM ELEMENTS
// ===============================
const BASE_URL = "";

const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const fabAdd = document.getElementById('fab-add');
const modal = document.getElementById('expense-modal');
const closeModalBtn = document.getElementById('close-modal');
const expenseForm = document.getElementById('expense-form');
const dashTransactionList = document.getElementById('dashboard-transaction-list');
const fullTransactionList = document.getElementById('full-transaction-list');

// Analytics elements
const totalBalanceEl = document.getElementById('total-balance');
const totalExpenseEl = document.getElementById('total-expense');
const totalSavingsEl = document.getElementById('total-savings');
const budgetRemainingEl = document.getElementById('budget-remaining');
const progressBar = document.querySelector('.progress');

// AI elements
const aiInput = document.getElementById('main-ai-input');
const aiSendBtn = document.getElementById('main-ai-send-btn');
const aiChatHistory = document.getElementById('main-ai-chat-history');
const quickActions = document.getElementById('main-quick-actions');

// Auth & Nav Elements
const authModal = document.getElementById('auth-modal');
const closeAuthModal = document.getElementById('close-auth-modal');
const authBtn = document.getElementById('auth-btn');
const authForm = document.getElementById('auth-form');
const navItems = document.querySelectorAll('.nav-item');
const appViews = document.querySelectorAll('.app-view');

// Budget Elements
const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-input');
const currentBudgetDisplay = document.getElementById('current-budget-display');

// Goals Elements
const goalForm = document.getElementById('goal-form');
const goalsListContainer = document.getElementById('goals-list');
const recordBtn = document.getElementById('record-btn');
const recordStatus = document.getElementById('record-status');
const audioPlayback = document.getElementById('audio-playback');

// Report Elements
const generateReportBtn = document.getElementById('generate-report-btn');
const reportContent = document.getElementById('report-content');
const reportPlaceholder = document.getElementById('report-placeholder');

// Settings Elements
const settingsThemeToggle = document.getElementById('settings-theme-toggle');
const colorPicker = document.getElementById('color-picker');
const languageSelect = document.getElementById('language-select');
const dashboardMonth = document.getElementById('dashboard-month');
const profilePicUpload = document.getElementById('profile-pic-upload');
const textSizeSelect = document.getElementById('text-size-select');
const logoutBtn = document.getElementById('logout-btn');


// ===============================
// API WRAPPER
// ===============================
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('expense-token');
    const headers = options.headers || {};
    if(token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    options.headers = headers;
    const response = await fetch(BASE_URL + endpoint, options);
    if(response.status === 401) {
        showToast("Session expired. Please log in.");
        localStorage.removeItem('expense-token');
        document.getElementById('auth-modal').classList.remove('hidden');
        throw new Error("Unauthorized");
    }
    return response;
}

// State

const transactionSearch = document.getElementById('transaction-search');
const transactionCategoryFilter = document.getElementById('transaction-category-filter');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Pagination State
let currentPage = 1;

if(transactionSearch) transactionSearch.addEventListener('input', () => { currentPage = 1; loadExpenses(); });
if(transactionCategoryFilter) transactionCategoryFilter.addEventListener('change', () => { currentPage = 1; loadExpenses(); });
if(prevPageBtn) prevPageBtn.addEventListener('click', () => { currentPage--; loadExpenses(); });
if(nextPageBtn) nextPageBtn.addEventListener('click', () => { currentPage++; loadExpenses(); });

let expenses = [];
let chartInstance = null;
let pieChartInstance = null;
let isDarkMode = localStorage.getItem('expense-theme') !== 'light'; 
let vantaEffect = null;
let CURRENT_BUDGET = 50000; 

// Audio State
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let isRecording = false;

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initVanta();
    initNav();
    initAuth();
    
    const token = localStorage.getItem('expense-token');
    if(token) {
        loadBudget();
        loadExpenses();
        loadChatHistory();
        loadGoals();
    } else {
        showToast("Welcome! Please log in to view your data.");
        authModal.classList.remove('hidden');
    }
    initAudioRecording();
    initSettings();
});

// ===============================
// THEME & BACKGROUND
// ===============================
function initTheme() {
    if (!isDarkMode) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggleBtn.innerHTML = "<i class='bx bx-sun'></i>";
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('expense-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = "<i class='bx bx-moon'></i>";
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggleBtn.innerHTML = "<i class='bx bx-sun'></i>";
    }
    if (expenses.length > 0) renderChart(expenses);
}

themeToggleBtn.addEventListener('click', toggleTheme);

function initVanta() {
    vantaEffect = VANTA.HALO({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        xOffset: 0.15,
        yOffset: 0.15,
        size: 1.50,
        backgroundColor: 0x0f111a,
        baseColor: 0x6366f1,
    });
}

// ===============================
// SETTINGS
// ===============================
function initSettings() {
    // Theme Toggle from Settings
    settingsThemeToggle.addEventListener('click', () => {
        toggleTheme();
        showToast("Theme updated!");
    });

    // Custom Color Picker
    colorPicker.addEventListener('input', (e) => {
        const newColor = e.target.value;
        // Update CSS variable
        document.documentElement.style.setProperty('--primary-color', newColor);
        
        // Update Chart.js if exists
        if (chartInstance) {
            chartInstance.data.datasets[0].borderColor = newColor;
            chartInstance.data.datasets[0].pointBorderColor = newColor;
            chartInstance.update();
        }

        // Update Vanta.js
        if (vantaEffect) {
            vantaEffect.setOptions({
                baseColor: parseInt(newColor.replace('#', '0x'))
            });
        }
    });
    colorPicker.addEventListener('change', () => {
        showToast("Theme color updated! 🎨");
    });

    // Language Selector
    languageSelect.addEventListener('change', (e) => {
        const langText = e.target.options[e.target.selectedIndex].text;
        showToast(`Language changed to ${langText} 🌍`);
        // Here you would implement actual i18n logic
    });

    // Dashboard Calendar Interaction
    dashboardMonth.addEventListener('change', (e) => {
        showToast(`Showing data for ${e.target.value}`);
        // Here you would fetch and filter data for that month
    });

    // Profile Picture Upload
    profilePicUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const url = e.target.result;
                document.querySelectorAll('.avatar, .header-avatar').forEach(el => {
                    el.style.backgroundImage = `url(${url})`;
                    el.innerText = ''; // Clear the initials
                });
                showToast("Profile picture updated! 📸");
            }
            reader.readAsDataURL(file);
        }
    });

    // Text Size
    textSizeSelect.addEventListener('change', (e) => {
        document.documentElement.style.fontSize = e.target.value;
        showToast("Text size updated! 📝");
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        showToast("Logged out successfully! 👋");
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
}

// ===============================
// NAVIGATION & AUTHENTICATION
// ===============================
function initNav() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            if(!viewId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            appViews.forEach(view => view.classList.remove('active'));
            
            const targetView = document.getElementById('view-' + viewId);
            if (targetView) targetView.classList.add('active');
        });
    });
}

let isSignupMode = false;
const authTitle = document.getElementById('auth-title');
const authName = document.getElementById('auth-name');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchLink = document.getElementById('auth-switch-link');

function initAuth() {
    authBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
    closeAuthModal.addEventListener('click', () => authModal.classList.add('hidden'));
    
    authSwitchLink.addEventListener('click', (e) => {
        e.preventDefault();
        isSignupMode = !isSignupMode;
        if(isSignupMode) {
            authTitle.innerText = "Create Account";
            authName.style.display = "block";
            authName.setAttribute("required", "true");
            authSubmitBtn.innerText = "Sign Up";
            authSwitchText.innerText = "Already have an account?";
            authSwitchLink.innerText = "Login";
        } else {
            authTitle.innerText = "Sign In";
            authName.style.display = "none";
            authName.removeAttribute("required");
            authSubmitBtn.innerText = "Login";
            authSwitchText.innerText = "Don't have an account?";
            authSwitchLink.innerText = "Sign Up";
        }
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name').value || "User";
        
        const endpoint = isSignupMode ? '/api/auth/register' : '/api/auth/login';
        const body = isSignupMode ? { name, email, password } : { email, password };

        try {
            const res = await fetch(BASE_URL + endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if(data.error) return showToast(`Error: ${data.error}`);
            
            localStorage.setItem('expense-token', data.token);
            showToast(isSignupMode ? "Account created successfully! 🎉" : "Logged in successfully! 🎉");
            authModal.classList.add('hidden');
            authForm.reset();
            window.location.reload();
        } catch(err) {
            showToast("Network error. Try again.");
        }
    });
}

// ===============================
// MODAL & FORM (EXPENSES)
// ===============================
fabAdd.addEventListener('click', () => modal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        description: document.getElementById('desc-input').value,
        amount: parseFloat(document.getElementById('amount-input').value),
        category: document.getElementById('category-input').value,
        paymentMethod: document.getElementById('payment-input').value,
        type: document.getElementById('type-input').value,
        date: document.getElementById('date-input').value
    };

    try {
        await apiFetch(`/api/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        showToast("Transaction saved! 🎉");
        modal.classList.add('hidden');
        expenseForm.reset();
        
        loadExpenses();
    } catch (err) {
        showToast("Failed to save transaction.");
    }
});

// ===============================
// DATA LOADING
// ===============================
async function loadBudget() {
    try {
        const res = await apiFetch(`/api/budget`);
        const data = await res.json();
        CURRENT_BUDGET = data.amount || 50000;
        currentBudgetDisplay.innerText = `₹${CURRENT_BUDGET.toLocaleString()}`;
    } catch (err) {
        console.error("Budget fetch error");
    }
}

async function loadAnalyticsData() {
    try {
        const res = await apiFetch(`/api/analytics`);
        const data = await res.json();
        
        totalBalanceEl.innerText = `₹${data.totalBalance.toLocaleString()}`;
        totalExpenseEl.innerText = `₹${data.totalExpense.toLocaleString()}`;
        totalSavingsEl.innerText = `₹${data.totalSavings.toLocaleString()}`;
        
        const remaining = CURRENT_BUDGET - data.totalExpense;
        budgetRemainingEl.innerText = `₹${remaining.toLocaleString()}`;
        
        const pct = Math.min(Math.max((data.totalExpense / CURRENT_BUDGET) * 100, 0), 100);
        progressBar.style.width = `${pct}%`;
        progressBar.style.backgroundColor = pct > 90 ? 'var(--danger-color)' : 'var(--warning-color)';
    } catch (err) {
        console.error("Analytics error", err);
    }
}


async function loadExpenses() {
    try {
        const search = transactionSearch ? transactionSearch.value : '';
        const category = transactionCategoryFilter ? transactionCategoryFilter.value : 'All';
        
        const res = await apiFetch(`/api/expenses?page=${currentPage}&limit=10&search=${search}&category=${category}`);
        const data = await res.json();
        
        expenses = data.allExpenses || []; // For charts
        const pagedExpenses = data.expenses || [];
        
        if(pageInfo) pageInfo.innerText = `Page ${data.currentPage} of ${data.totalPages || 1}`;
        if(prevPageBtn) prevPageBtn.disabled = data.currentPage <= 1;
        if(nextPageBtn) nextPageBtn.disabled = data.currentPage >= data.totalPages;

        loadAnalyticsData(); 
        renderTransactions(expenses, dashTransactionList, 5); 
        renderTransactions(pagedExpenses, fullTransactionList, 100); 
        renderChart(expenses);

        // Budget Alert Logic
        if(expenses.length > 0 && CURRENT_BUDGET > 0) {
            const thisMonthExpenses = expenses.filter(e => {
                const ed = new Date(e.date);
                const now = new Date();
                return ed.getMonth() === now.getMonth() && ed.getFullYear() === now.getFullYear() && e.type === 'expense';
            }).reduce((sum, e) => sum + e.amount, 0);

            if(thisMonthExpenses > CURRENT_BUDGET) {
                showToast(`🚨 WARNING: You have exceeded your monthly budget of ₹${CURRENT_BUDGET}!`, 5000);
            }
        }
    } catch (err) {
        console.error("Expenses error", err);
    }
}

async function deleteTransaction(id) {
    if(!confirm("Delete transaction?")) return;
    try {
        await apiFetch(`/api/expenses/${id}`, { method: "DELETE" });
        loadExpenses();
        showToast("Deleted.");
    } catch (err) {
        console.error("Delete error", err);
    }
}

// ===============================
// BUDGET FORM
// ===============================
budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(budgetInput.value);
    try {
        await apiFetch(`/api/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        });
        showToast("Budget updated! 🎯");
        budgetInput.value = '';
        loadBudget().then(loadAnalyticsData);
    } catch(err) {
        showToast("Failed to update budget.");
    }
});

// ===============================
// UI RENDERING (TABLES & CHARTS)
// ===============================
function renderTransactions(data, container, limit) {
    container.innerHTML = '';
    const list = data.slice(0, limit);
    
    if (list.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="text-align:center;">No transactions yet.</td></tr>`;
        return;
    }

    list.forEach(tx => {
        const isIncome = tx.type === 'income';
        const sign = isIncome ? '+' : '-';
        const amountClass = isIncome ? 'positive' : 'negative';
        const catLower = tx.category.toLowerCase();
        
        let icon = 'bx-receipt';
        if(catLower === 'food') icon = 'bx-restaurant';
        if(catLower === 'shopping') icon = 'bx-shopping-bag';
        if(catLower === 'transport') icon = 'bx-car';
        if(catLower === 'income') icon = 'bx-wallet';
        if(catLower === 'entertainment') icon = 'bx-movie';

        let methodIcon = 'bx-credit-card';
        if(tx.paymentMethod === 'UPI') methodIcon = 'bx-mobile';
        if(tx.paymentMethod === 'Cash') methodIcon = 'bx-money';
        if(tx.paymentMethod === 'Bank Transfer') methodIcon = 'bx-building-house';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(tx.date)}</td>
            <td>
                <div class="desc-cell">
                    <div class="desc-icon"><i class='bx ${icon}'></i></div>
                    <strong>${tx.description}</strong>
                </div>
            </td>
            <td>
                <span class="category-pill cat-${catLower}">${tx.category}</span>
            </td>
            <td>
                <div class="method-cell">
                    <i class='bx ${methodIcon}'></i> ${tx.paymentMethod}
                </div>
            </td>
            <td class="amount ${amountClass}">
                ${sign} ₹${tx.amount.toLocaleString()}
                <button class="delete-action" onclick="deleteTransaction('${tx._id}')"><i class='bx bx-trash'></i></button>
            </td>
        `;
        container.appendChild(tr);
    });
}

function renderChart(data) {
    const canvas = document.getElementById("expenseChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dailyMap = {};
    const sorted = [...data].sort((a,b) => new Date(a.date) - new Date(b.date));
    
    sorted.forEach(e => {
        if (e.type === 'expense') {
            const d = e.date.substring(8, 10) + ' ' + getMonthName(e.date);
            dailyMap[d] = (dailyMap[d] || 0) + e.amount;
        }
    });

    if (chartInstance) chartInstance.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: Object.keys(dailyMap),
            datasets: [{
                label: "Expenses",
                data: Object.values(dailyMap),
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0f111a',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

// ===============================
// GOALS & AUDIO RECORDING
// ===============================
function initAudioRecording() {
    recordBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    audioChunks = [];
                    const audioUrl = URL.createObjectURL(audioBlob);
                    audioPlayback.src = audioUrl;
                    audioPlayback.style.display = 'block';
                    recordStatus.innerText = 'Audio recorded.';
                };

                mediaRecorder.start();
                isRecording = true;
                recordBtn.style.background = "white";
                recordBtn.style.color = "var(--danger-color)";
                recordBtn.classList.add("bx-flashing");
                recordStatus.innerText = 'Recording... click to stop';
            } catch (err) {
                alert("Microphone access denied.");
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordBtn.style.background = "var(--danger-color)";
            recordBtn.style.color = "white";
            recordBtn.classList.remove("bx-flashing");
        }
    });
}

goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('goal-title').value;
    const photoFile = document.getElementById('goal-photo').files[0];

    const formData = new FormData();
    formData.append('title', title);
    if(photoFile) formData.append('photo', photoFile);
    if(audioBlob) formData.append('audio', audioBlob, 'voice-note.webm');

    try {
        await apiFetch(`/api/goals`, {
            method: "POST",
            body: formData
        });
        showToast("Goal created successfully! 🎯");
        goalForm.reset();
        audioBlob = null;
        audioPlayback.style.display = 'none';
        recordStatus.innerText = 'Click mic to record';
        loadGoals();
    } catch(err) {
        showToast("Failed to create goal.");
    }
});

async function loadGoals() {
    try {
        const res = await apiFetch(`/api/goals`);
        const goals = await res.json();
        
        goalsListContainer.innerHTML = '';
        if(goals.length === 0) {
            goalsListContainer.innerHTML = "<p style='color:var(--text-secondary);'>No goals set yet.</p>";
            return;
        }

        goals.forEach(goal => {
            let mediaHtml = '';
            if(goal.photoUrl) {
                mediaHtml += `<img src="${BASE_URL}${goal.photoUrl}" style="width:100%; max-height:150px; object-fit:cover; border-radius:8px; margin-top:10px;">`;
            }
            if(goal.audioUrl) {
                mediaHtml += `<audio controls src="${BASE_URL}${goal.audioUrl}" style="width:100%; height:35px; margin-top:10px;"></audio>`;
            }

            const div = document.createElement('div');
            div.className = 'glass-panel';
            div.style.padding = '15px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="font-size:1.1rem;">${goal.title}</h4>
                    <button class="delete-action" onclick="deleteGoal('${goal._id}')"><i class='bx bx-trash'></i></button>
                </div>
                ${mediaHtml}
            `;
            goalsListContainer.appendChild(div);
        });
    } catch(err) {
        console.error(err);
    }
}

async function deleteGoal(id) {
    if(!confirm("Delete goal?")) return;
    try {
        await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
        loadGoals();
        showToast("Deleted Goal.");
    } catch (err) {
        console.error("Delete error", err);
    }
}

// ===============================
// AI CHAT
// ===============================
async function loadChatHistory() {
    try {
        const res = await apiFetch(`/api/ai/chats`);
        const chats = await res.json();
        
        chats.forEach(chat => {
            appendMessage('You', chat.query, 'chat-user');
            appendMessage('AI', chat.response, 'chat-ai');
        });
        scrollToBottom();
    } catch (err) {
        console.error("Failed to load chat", err);
    }
}

aiSendBtn.addEventListener('click', sendAiMessage);
aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAiMessage();
});

document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        aiInput.value = e.target.innerText;
        sendAiMessage();
    });
});

async function sendAiMessage() {
    const query = aiInput.value.trim();
    if (!query) return;

    aiInput.value = '';
    if(quickActions) quickActions.style.display = 'none';

    appendMessage('You', query, 'chat-user');
    scrollToBottom();

    const loadingId = appendMessage('AI', '<i class="bx bx-dots-horizontal-rounded bx-flashing"></i> Thinking...', 'chat-ai');

    try {
        const res = await apiFetch(`/api/ai/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expenses, query })
        });

        const data = await res.json();
        const loadingEl = document.getElementById(loadingId);
        
        if (res.ok) {
            loadingEl.innerHTML = data.result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        } else {
            loadingEl.innerHTML = `<span class="negative">Error: ${data.error}</span>`;
        }
    } catch (err) {
        document.getElementById(loadingId).innerHTML = `<span class="negative">Connection failed.</span>`;
    }
    scrollToBottom();
}

function appendMessage(sender, text, className) {
    const div = document.createElement('div');
    div.className = `chat-msg ${className}`;
    const id = 'msg-' + Date.now();
    div.id = id;
    div.innerHTML = text;
    aiChatHistory.appendChild(div);
    return id;
}

function scrollToBottom() {
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
}

// ===============================
// REPORTS GENERATION
// ===============================
generateReportBtn.addEventListener('click', () => {
    reportPlaceholder.style.display = 'none';
    reportContent.style.display = 'block';

    let totalInc = 0;
    let totalExp = 0;
    let catTotals = {};

    expenses.forEach(tx => {
        if(tx.type === 'income') totalInc += tx.amount;
        else {
            totalExp += tx.amount;
            catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
        }
    });

    document.getElementById('report-total-income').innerText = `₹${totalInc.toLocaleString()}`;
    document.getElementById('report-total-expense').innerText = `₹${totalExp.toLocaleString()}`;

    // Render Pie Chart
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    if(pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catTotals),
            datasets: [{
                data: Object.values(catTotals),
                backgroundColor: [
                    '#f87171', // Food
                    '#c4b5fd', // Shopping
                    '#60a5fa', // Transport
                    '#fbbf24', // Entertainment
                    '#9ca3af'  // Other
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#fff' } }
            }
        }
    });
});

// ===============================
// UTILS
// ===============================
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.getDate() + ' ' + getMonthName(dateStr) + ' ' + d.getFullYear();
}

function getMonthName(dateStr) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(dateStr.split('-')[1], 10) - 1;
    return months[monthIndex];
}