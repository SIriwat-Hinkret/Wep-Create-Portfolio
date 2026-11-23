// Portfolios and Items are stored on the PHP server.
let portfolios = [];
let selectedId = null;

async function readJson(response) {
    const body = await response.text();
    try {
        return JSON.parse(body);
    } catch {
        throw new Error('The server did not answer with JSON (HTTP ' + response.status + '). Open this app through the PHP/Apache server.');
    }
}

async function requestForm(url, formData) {
    const response = await fetch(url, { method: 'POST', body: formData });
    const result = await readJson(response);
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
}

async function loadPortfolios() {
    const response = await fetch('api/portfolios.php');
    const result = await readJson(response);
    if (!response.ok) throw new Error(result.error || 'Could not load Portfolios');
    portfolios = Array.isArray(result) ? result : [];
    if (!portfolios.some(p => p.id === selectedId)) selectedId = portfolios[0]?.id ?? null;
    showPortfolioList();
    showSelectedPortfolio();
}

function currentPortfolio() {
    return portfolios.find(p => p.id === selectedId) || null;
}

function showPortfolioList() {
    const list = document.querySelector('#portfolio-list');
    list.replaceChildren();
    document.querySelector('#list-empty').hidden = portfolios.length > 0;
    for (const portfolio of portfolios) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-light portfolio-btn text-start';
        if (portfolio.id === selectedId) button.classList.add('active');
        button.textContent = `${portfolio.displayName} (${(portfolio.items || []).length} items)`;
        button.addEventListener('click', () => {
            selectedId = portfolio.id;
            showPortfolioList();
            showSelectedPortfolio();
        });
        list.appendChild(button);
    }
}

function addItemActionButton(parent, label, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-sm ${className}`;
    button.textContent = label;
    button.addEventListener('click', handler);
    parent.appendChild(button);
}

function showSelectedPortfolio() {
    const portfolio = currentPortfolio();
    const hasPortfolio = Boolean(portfolio);
    for (const id of ['edit-portfolio', 'delete-portfolio', 'export-portfolio', 'import-portfolio']) {
        const button = document.getElementById(id);
        if (button) button.disabled = !hasPortfolio;
    }

    document.querySelector('#portfolio-name').textContent = portfolio?.displayName || 'Choose a Portfolio';
    document.querySelector('#portfolio-enjoy').textContent = portfolio?.whatIEnjoy || '';
    document.querySelector('#portfolio-tried').textContent = portfolio?.whatIveTried || '';
    document.querySelector('#portfolio-curious').textContent = portfolio?.whatImCuriousAbout || '';
    const list = document.querySelector('#item-list');
    list.replaceChildren();
    if (!portfolio) return;

    for (const item of (portfolio.items || [])) {
        const card = document.createElement('div');
        card.className = 'item-card rounded-3 p-3';
        const headingRow = document.createElement('div');
        headingRow.className = 'd-flex flex-wrap align-items-start justify-content-between gap-2';
        const title = document.createElement('h3');
        title.className = 'h6 fw-bold mb-1';
        title.textContent = [item.title, item.type, item.date].filter(Boolean).join(' · ');
        const actions = document.createElement('div');
        actions.className = 'd-flex gap-2';
        addItemActionButton(actions, 'Edit', 'btn-outline-primary', () => openEditor('item', item));
        addItemActionButton(actions, 'Reflection', 'btn-outline-success', () => openReflectionEditor(item));
        addItemActionButton(actions, 'Delete', 'btn-outline-danger', () => deleteItem(item));
        headingRow.append(title, actions);
        card.appendChild(headingRow);

        const detailLines = [
            item.description,
            item.role ? `Role: ${item.role}` : '',
            `Skills: ${(item.skills || []).join(', ')}`,
            item.reflection?.whatIDid ? `What I did: ${item.reflection.whatIDid}` : '',
            item.reflection?.whatILearned ? `What I learned: ${item.reflection.whatILearned}` : '',
            item.reflection?.challenge ? `Challenge: ${item.reflection.challenge}` : '',
            item.reflection?.nextStep ? `Next step: ${item.reflection.nextStep}` : ''
        ].filter(Boolean);
        const text = document.createElement('p');
        text.className = 'small mb-1 mt-2';
        text.textContent = detailLines.join(' — ');
        card.appendChild(text);
        for (const url of (item.evidence || [])) {
            const link = document.createElement('a');
            link.href = url;
            link.textContent = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'small d-block';
            card.appendChild(link);
        }
        list.appendChild(card);
    }
}

// A single reusable native dialog is used for editing Portfolio and Item data.
function ensureEditorDialog() {
    let dialog = document.getElementById('record-editor');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'record-editor';
    dialog.className = 'border-0 rounded-4 shadow p-0';
    dialog.style.width = 'min(720px, calc(100% - 2rem))';
    dialog.style.maxHeight = '90vh';
    dialog.innerHTML = `
      <div class="p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 fw-bold mb-0" id="editor-title">Edit</h2>
          <button type="button" class="btn-close" id="editor-close" aria-label="Close"></button>
        </div>
        <form id="editor-form">
          <div id="editor-fields"></div>
          <p class="small text-danger mt-2 mb-2" id="editor-error" role="alert"></p>
          <div class="d-flex gap-2">
            <button class="btn btn-success flex-grow-1" type="submit">Save changes</button>
            <button class="btn btn-outline-secondary" type="button" id="editor-cancel">Cancel</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('#editor-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('#editor-cancel').addEventListener('click', () => dialog.close());
    return dialog;
}

function field(label, name, value = '', type = 'text', full = false) {
    const wrapper = document.createElement('div');
    wrapper.className = full ? 'col-12' : 'col-md-6';
    const inputId = `edit-${name}`;
    const caption = document.createElement('label');
    caption.className = 'form-label';
    caption.htmlFor = inputId;
    caption.textContent = label;
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    input.className = 'form-control mb-2';
    input.id = inputId;
    input.name = name;
    if (type === 'textarea') input.rows = 2;
    else input.type = type;
    input.value = value ?? '';
    wrapper.append(caption, input);
    return wrapper;
}

function openEditor(kind, record) {
    const dialog = ensureEditorDialog();
    const fields = dialog.querySelector('#editor-fields');
    fields.replaceChildren();
    dialog.querySelector('#editor-title').textContent = kind === 'portfolio' ? 'Edit Portfolio' : 'Edit Portfolio Item';
    const grid = document.createElement('div');
    grid.className = 'row g-2';
    if (kind === 'portfolio') {
        grid.append(
            field('Display name *', 'displayName', record.displayName),
            field('What I enjoy', 'whatIEnjoy', record.whatIEnjoy),
            field("What I've tried", 'whatIveTried', record.whatIveTried),
            field("What I'm curious about", 'whatImCuriousAbout', record.whatImCuriousAbout, 'textarea', true)
        );
    } else {
        const reflection = record.reflection || {};
        grid.append(
            field('Title *', 'title', record.title),
            field('Type', 'type', record.type),
            field('Date', 'date', record.date, 'date'),
            field('Role', 'role', record.role),
            field('Skills (comma separated)', 'skills', (record.skills || []).join(', '), 'text', true),
            field('Description', 'description', record.description, 'textarea', true),
            field('What I did', 'whatIDid', reflection.whatIDid, 'textarea'),
            field('What I learned', 'whatILearned', reflection.whatILearned, 'textarea'),
            field('Challenge', 'challenge', reflection.challenge, 'textarea'),
            field('Next step', 'nextStep', reflection.nextStep, 'textarea'),
            field('Evidence URLs (one per line)', 'evidence', (record.evidence || []).join('\n'), 'textarea', true)
        );
    }
    fields.appendChild(grid);
    dialog.querySelector('#editor-error').textContent = '';
    dialog.querySelector('#editor-form').onsubmit = async (event) => {
        event.preventDefault();
        const error = dialog.querySelector('#editor-error');
        const data = new FormData(event.currentTarget);
        data.append('action', 'update');
        try {
            if (kind === 'portfolio') {
                data.append('id', record.id);
                await requestForm('api/portfolios.php', data);
            } else {
                data.append('id', record.id);
                data.append('portfolioId', selectedId);
                data.set('skills', JSON.stringify(String(data.get('skills') || '').split(',').map(s => s.trim()).filter(Boolean)));
                data.set('evidence', JSON.stringify(String(data.get('evidence') || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
                await requestForm('api/items.php', data);
            }
            dialog.close();
            await loadPortfolios();
        } catch (e) {
            error.textContent = e.message;
        }
    };
    dialog.showModal();
}

function openReflectionEditor(item) {
    const dialog = document.createElement('dialog');
    dialog.className = 'border-0 rounded-4 shadow p-0';
    dialog.style.width = 'min(640px, calc(100% - 2rem))';
    dialog.style.maxHeight = '90vh';
    const reflection = item.reflection || {};
    dialog.innerHTML = `
      <form id="reflection-form" class="p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 fw-bold mb-0">Edit Reflection</h2>
          <button type="button" class="btn-close" data-close aria-label="Close"></button>
        </div>
        <label class="form-label" for="reflection-did">What I did</label>
        <textarea class="form-control mb-2" id="reflection-did" rows="2" maxlength="2000"></textarea>
        <label class="form-label" for="reflection-learned">What I learned</label>
        <textarea class="form-control mb-2" id="reflection-learned" rows="2" maxlength="2000"></textarea>
        <label class="form-label" for="reflection-challenge">Challenge</label>
        <textarea class="form-control mb-2" id="reflection-challenge" rows="2" maxlength="2000"></textarea>
        <label class="form-label" for="reflection-next">Next step</label>
        <textarea class="form-control mb-2" id="reflection-next" rows="2" maxlength="2000"></textarea>
        <p class="small text-danger" id="reflection-error" role="alert"></p>
        <div class="d-flex gap-2">
          <button class="btn btn-success flex-grow-1" type="submit">Save Reflection</button>
          <button class="btn btn-outline-secondary" type="button" data-close>Cancel</button>
        </div>
      </form>`;
    document.body.appendChild(dialog);
    const form = dialog.querySelector('form');
    form.querySelector('#reflection-did').value = reflection.whatIDid || '';
    form.querySelector('#reflection-learned').value = reflection.whatILearned || '';
    form.querySelector('#reflection-challenge').value = reflection.challenge || '';
    form.querySelector('#reflection-next').value = reflection.nextStep || '';
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const error = form.querySelector('#reflection-error');
        const payload = {
            portfolioId: selectedId,
            itemId: item.id,
            reflection: {
                whatIDid: form.querySelector('#reflection-did').value.trim(),
                whatILearned: form.querySelector('#reflection-learned').value.trim(),
                challenge: form.querySelector('#reflection-challenge').value.trim(),
                nextStep: form.querySelector('#reflection-next').value.trim()
            }
        };
        try {
            const response = await fetch('api/reflection.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Could not save Reflection');
            dialog.close();
            await loadPortfolios();
        } catch (e) { error.textContent = e.message; }
    });
    dialog.showModal();
}

async function deletePortfolio() {
    const portfolio = currentPortfolio();
    if (!portfolio) return;
    if (!confirm(`Delete Portfolio "${portfolio.displayName}" and all ${(portfolio.items || []).length} Items inside it? This cannot be undone.`)) return;
    const data = new FormData();
    data.append('action', 'delete');
    data.append('id', portfolio.id);
    try {
        await requestForm('api/portfolios.php', data);
        selectedId = null;
        await loadPortfolios();
    } catch (e) {
        alert(e.message);
    }
}

async function deleteItem(item) {
    const portfolio = currentPortfolio();
    if (!portfolio || !confirm(`Delete Portfolio Item "${item.title}"? This cannot be undone.`)) return;
    const data = new FormData();
    data.append('action', 'delete');
    data.append('id', item.id);
    data.append('portfolioId', portfolio.id);
    try {
        await requestForm('api/items.php', data);
        await loadPortfolios();
    } catch (e) {
        alert(e.message);
    }
}

// Create Portfolio
document.querySelector('#portfolio-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget; // Keep the form reference before awaiting the API.
    const error = document.querySelector('#portfolio-error');
    try {
        const data = new FormData(form);
        const created = await requestForm('api/portfolios.php', data);
        error.textContent = '';
        form.reset();
        selectedId = created.id;
        await loadPortfolios();
    } catch (e) { error.textContent = e.message; }
});

// Create Portfolio Item
document.querySelector('#item-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget; // currentTarget is not reliable after an await.
    const error = document.querySelector('#item-error');
    if (!selectedId) { error.textContent = 'Choose a Portfolio first.'; return; }
    try {
        const data = new FormData(form);
        data.append('portfolioId', selectedId);
        await requestForm('api/items.php', data);
        error.textContent = '';
        form.reset();
        await loadPortfolios();
    } catch (e) { error.textContent = e.message; }
});

document.querySelector('#edit-portfolio')?.addEventListener('click', () => {
    const portfolio = currentPortfolio();
    if (portfolio) openEditor('portfolio', portfolio);
});
document.querySelector('#delete-portfolio')?.addEventListener('click', deletePortfolio);

loadPortfolios().catch((e) => {
    const message = document.querySelector('#list-empty');
    message.hidden = false;
    message.className = 'small text-danger mb-0';
    message.textContent = e.message;
});


// M13 Peer Testing & Constructive Feedback: feedback is stored on the PHP server.
const feedbackForm = document.querySelector('#feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async event => {
        event.preventDefault();
        const status = document.querySelector('#feedback-status');
        const form = new FormData(feedbackForm);
        const payload = Object.fromEntries(form.entries());
        status.textContent = 'Submitting feedback...';
        status.className = 'small mb-2 text-muted';
        try {
            const response = await fetch('api/feedback.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Could not submit feedback');
            feedbackForm.reset();
            status.textContent = 'Feedback saved successfully.';
            status.className = 'small mb-2 text-success';
        } catch (error) {
            status.textContent = error.message;
            status.className = 'small mb-2 text-danger';
        }
    });
}
