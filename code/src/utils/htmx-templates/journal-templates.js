/**
 * HTMX Templates for Journal
 * code/src/utils/htmx-templates/journal-templates.js
 */

import { escapeHtml, formatDate } from "../html-templates.js";

/**
 * Create the main Journal page HTML
 * @param {Object} user - User object
 * @param {Array} entries - List of journal entries
 * @param {string} [currentType=''] - Current filter type
 * @returns {string} HTML string
 */
export function createJournalPage(user, entries = [], currentType = '') {
    return `
    <div class="journal-layout">
        <div class="journal-header">
            <h1>Journal</h1>
            <p class="journal-subtitle">Document your work and reflections.</p>
        </div>

        <!-- Editor Section -->
        <div class="journal-editor-card">
            <form hx-post="/journal" hx-target="#journal-list-container" hx-swap="afterbegin" hx-on:htmx:after-request="this.reset()">
                <div class="editor-header">
                    <div class="type-selector">
                        <label class="type-option">
                            <input type="radio" name="entryType" value="WORK_LOG" checked onchange="toggleMoodSelector(false)">
                            <span class="type-pill"><i class="fa-solid fa-briefcase"></i> Work Log</span>
                        </label>
                        <label class="type-option">
                            <input type="radio" name="entryType" value="EMOTIONAL_REFLECTION" onchange="toggleMoodSelector(true)">
                            <span class="type-pill"><i class="fa-solid fa-heart"></i> Reflection</span>
                        </label>
                    </div>
                    <div id="mood-selector" class="mood-selector" style="display: none;">
                        <select name="mood" class="form-select form-select-sm">
                            <option value="">How are you feeling?</option>
                            <option value="Happy">😊 Happy</option>
                            <option value="Neutral">😐 Neutral</option>
                            <option value="Frustrated">😫 Frustrated</option>
                            <option value="Excited">🤩 Excited</option>
                            <option value="Tired">😴 Tired</option>
                        </select>
                    </div>
                </div>

                <div class="editor-body">
                    <input type="text" name="title" class="editor-title-input" placeholder="Title (optional)">
                    <textarea name="content" class="editor-content-input" placeholder="Write something..." required rows="4"></textarea>
                </div>

                <div class="editor-footer">
                    <button type="submit" class="btn btn--primary">
                        <i class="fa-solid fa-paper-plane"></i> Post Entry
                    </button>
                </div>
            </form>
        </div>

        <!-- Filters & List -->
        <div class="journal-feed">
            <div class="feed-filters">
                <button class="filter-btn ${currentType === '' ? 'active' : ''}"
                        hx-get="/journal" hx-target="#main-content" hx-push-url="true">
                    All
                </button>
                <button class="filter-btn ${currentType === 'WORK_LOG' ? 'active' : ''}"
                        hx-get="/journal?type=WORK_LOG" hx-target="#main-content" hx-push-url="true">
                    Work Logs
                </button>
                <button class="filter-btn ${currentType === 'EMOTIONAL_REFLECTION' ? 'active' : ''}"
                        hx-get="/journal?type=EMOTIONAL_REFLECTION" hx-target="#main-content" hx-push-url="true">
                    Reflections
                </button>
            </div>

            <div id="journal-list-container" class="journal-list">
                ${createJournalList(entries)}
            </div>
        </div>
    </div>

    <script>
        function toggleMoodSelector(show) {
            const el = document.getElementById('mood-selector');
            if (el) el.style.display = show ? 'block' : 'none';
        }
    </script>
    `;
}

/**
 * Render the list of journal entries
 * @param {Array} entries
 * @returns {string} HTML string
 */
export function createJournalList(entries) {
    if (!entries || entries.length === 0) {
        return `
            <div class="empty-state">
                <i class="fa-regular fa-pen-to-square"></i>
                <p>No entries yet. Start writing!</p>
            </div>
        `;
    }

    return entries.map(entry => createJournalEntryCard(entry)).join("");
}

/**
 * Render a single journal entry card
 * @param {Object} entry
 * @returns {string} HTML string
 */
export function createJournalEntryCard(entry) {
    const isWorkLog = entry.entryType === 'WORK_LOG';
    const icon = isWorkLog ? 'fa-briefcase' : 'fa-heart';
    const typeLabel = isWorkLog ? 'Work Log' : 'Reflection';
    const typeClass = isWorkLog ? 'type-work' : 'type-reflection';

    // Format date nicely
    const date = new Date(entry.createdAt);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return `
    <div class="journal-card" id="entry-${entry.id}">
        <div class="card-header">
            <div class="entry-meta">
                <span class="entry-type-badge ${typeClass}">
                    <i class="fa-solid ${icon}"></i> ${typeLabel}
                </span>
                <span class="entry-date">${dateStr} at ${timeStr}</span>
                ${entry.isEdited ? '<span class="edited-badge">(edited)</span>' : ''}
                ${entry.mood ? `<span class="mood-badge">${entry.mood}</span>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn-icon-sm"
                        onclick="toggleEdit('${entry.id}')"
                        title="Edit">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="btn-icon-sm danger"
                        hx-delete="/journal/${entry.id}"
                        hx-target="#entry-${entry.id}"
                        hx-swap="outerHTML"
                        hx-confirm="Are you sure you want to delete this entry?"
                        title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>

        <div class="card-content">
            ${entry.title ? `<h3 class="entry-title">${escapeHtml(entry.title)}</h3>` : ''}
            <div class="entry-body">
                ${escapeHtml(entry.content).replace(/\n/g, '<br>')}
            </div>
        </div>

        <!-- Edit Form (Hidden by default) -->
        <form id="edit-form-${entry.id}" class="edit-form" style="display: none;"
              hx-put="/journal/${entry.id}"
              hx-target="#entry-${entry.id}"
              hx-swap="outerHTML">
            ${entry.mood ? `<input type="hidden" name="mood" value="${escapeHtml(entry.mood)}">` : ''}
            <input type="text" name="title" class="form-input mb-2" value="${escapeHtml(entry.title || '')}" placeholder="Title">
            <textarea name="content" class="form-input mb-2" rows="4">${escapeHtml(entry.content)}</textarea>
            <div class="form-actions">
                <button type="button" class="btn btn--sm btn--secondary" onclick="toggleEdit('${entry.id}')">Cancel</button>
                <button type="submit" class="btn btn--sm btn--primary">Save</button>
            </div>
        </form>
    </div>

    <script>
        // Ensure this script doesn't execute multiple times if multiple cards loaded
        if (typeof window.toggleEdit !== 'function') {
            window.toggleEdit = function(id) {
                const card = document.getElementById('entry-' + id);
                if (!card) return;
                const content = card.querySelector('.card-content');
                const form = document.getElementById('edit-form-' + id);

                if (form.style.display === 'none') {
                    content.style.display = 'none';
                    form.style.display = 'block';
                } else {
                    content.style.display = 'block';
                    form.style.display = 'none';
                }
            }
        }
    </script>
    `;
}
