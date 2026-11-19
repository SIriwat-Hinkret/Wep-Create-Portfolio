// Power Up! Portfolio — browser-only version using Local Storage
// No PHP, API, database, or server is required.

const STORAGE_KEY = "powerUpPortfolios_v1";

let portfolios = loadPortfolios();
let selectedId = portfolios[0]?.id ?? null;
let editingPortfolioId = null;
let editingItemId = null;

const $ = (selector) => document.querySelector(selector);

function makeId() {
    return (globalThis.crypto && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadPortfolios() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.map((portfolio) => ({
            id: String(portfolio.id || makeId()),
            displayName: String(portfolio.displayName || ""),
            whatIEnjoy: String(portfolio.whatIEnjoy || ""),
            whatIveTried: String(portfolio.whatIveTried || ""),
            whatImCuriousAbout: String(portfolio.whatImCuriousAbout || ""),
            items: Array.isArray(portfolio.items) ? portfolio.items.map(normalizeItem) : []
        }));
    } catch (error) {
        console.error("Could not read saved portfolios:", error);
        return [];
    }
}

function normalizeItem(item) {
    return {
        id: String(item.id || makeId()),
        title: String(item.title || ""),
        type: String(item.type || ""),
        date: String(item.date || ""),
        role: String(item.role || ""),
        description: String(item.description || ""),
        skills: Array.isArray(item.skills) ? item.skills.map(String) : [],
        whatIDid: String(item.whatIDid || ""),
        whatILearned: String(item.whatILearned || ""),
        challenge: String(item.challenge || ""),
        nextStep: String(item.nextStep || ""),
        evidence: Array.isArray(item.evidence) ? item.evidence.map(String) : []
    };
}

function savePortfolios() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
        return true;
    } catch (error) {
        console.error("Could not save portfolios:", error);
        alert("Unable to save. Your browser storage may be full or disabled.");
        return false;
    }
}

function selectedPortfolio() {
    return portfolios.find((portfolio) => portfolio.id === selectedId) || null;
}

function setText(selector, value) {
    $(selector).textContent = value || "—";
}

function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function showPortfolioList() {
    const list = $("#portfolio-list");
    list.replaceChildren();
    $("#portfolio-count").textContent = `${portfolios.length}`;

    $("#list-empty").hidden = portfolios.length > 0;

    portfolios.forEach((portfolio) => {
        const button = makeElement("button", "btn btn-light portfolio-btn text-start");
        if (portfolio.id === selectedId) button.classList.add("active");

        const name = makeElement("span", "portfolio-btn-name", portfolio.displayName);
        const count = makeElement("span", "portfolio-btn-count", `${portfolio.items.length} items`);
        button.append(name, count);
        button.type = "button";
        button.addEventListener("click", () => {
            selectedId = portfolio.id;
            cancelPortfolioEdit();
            cancelItemEdit();
            render();
        });
        list.appendChild(button);
    });
}

function addDetail(parent, label, value) {
    const row = makeElement("div", "detail-row");
    row.appendChild(makeElement("h4", "detail-label", label));
    row.appendChild(makeElement("p", "detail-value", value || "Not provided"));
    parent.appendChild(row);
}

function addEvidence(parent, url) {
    const row = makeElement("div", "detail-row");
    row.appendChild(makeElement("h4", "detail-label", "Evidence"));
    const value = makeElement("div", "detail-value");
    if (url) {
        try {
            const parsed = new URL(url);
            if (parsed.protocol === "http:" || parsed.protocol === "https:") {
                const link = makeElement("a", "evidence-link", url);
                link.href = parsed.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                value.appendChild(link);
            } else {
                value.textContent = "Invalid evidence URL";
            }
        } catch {
            value.textContent = "Invalid evidence URL";
        }
    } else {
        value.textContent = "Not provided";
    }
    row.appendChild(value);
    parent.appendChild(row);
}

function createItemCard(item, index) {
    const card = makeElement("article", "item-card");
    const heading = makeElement("h3", "item-title", item.title || "Untitled");
    const summary = makeElement("div", "item-summary");
    summary.append(
        makeElement("span", "item-meta", item.type || "No type"),
        makeElement("span", "item-meta", item.date || "No date")
    );

    const toggle = makeElement("button", "item-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.append(heading, summary, makeElement("span", "toggle-indicator", "＋"));
    toggle.setAttribute("aria-label", `Show details for ${item.title || "item"}`);

    const details = makeElement("div", "item-details");
    details.hidden = true;

    addDetail(details, "Role", item.role);
    addDetail(details, "Description", item.description);
    addDetail(details, "Skills", item.skills.length ? item.skills.join(", ") : "");
    addDetail(details, "What I did", item.whatIDid);
    addDetail(details, "What I learned", item.whatILearned);
    addDetail(details, "Challenge", item.challenge);
    addDetail(details, "Next step", item.nextStep);
    addEvidence(details, item.evidence[0] || "");

    const actions = makeElement("div", "item-actions");
    const edit = makeElement("button", "btn btn-sm btn-outline-secondary", "Edit item");
    edit.type = "button";
    edit.addEventListener("click", () => beginItemEdit(item.id));
    const remove = makeElement("button", "btn btn-sm btn-outline-danger", "Delete item");
    remove.type = "button";
    remove.addEventListener("click", () => deleteItem(item.id));
    actions.append(edit, remove);
    details.appendChild(actions);

    toggle.addEventListener("click", () => {
        const isOpen = !details.hidden;
        details.hidden = isOpen;
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.querySelector(".toggle-indicator").textContent = isOpen ? "＋" : "−";
        card.classList.toggle("is-expanded", !isOpen);
    });

    card.append(toggle, details);
    return card;
}

function showSelectedPortfolio() {
    const portfolio = selectedPortfolio();
    $("#portfolio-placeholder").hidden = Boolean(portfolio);
    $("#selected-portfolio").hidden = !portfolio;

    if (!portfolio) {
        $("#item-fieldset").disabled = true;
        $("#item-form-hint").textContent = "Choose or create a Portfolio first to add a project.";
        return;
    }

    setText("#portfolio-name", portfolio.displayName);
    setText("#portfolio-enjoy", portfolio.whatIEnjoy);
    setText("#portfolio-tried", portfolio.whatIveTried);
    setText("#portfolio-curious", portfolio.whatImCuriousAbout);

    const list = $("#item-list");
    list.replaceChildren();
    portfolio.items.forEach((item, index) => list.appendChild(createItemCard(item, index)));
    $("#item-count").textContent = `${portfolio.items.length} ${portfolio.items.length === 1 ? "item" : "items"}`;
    $("#item-empty").hidden = portfolio.items.length > 0;

    $("#item-fieldset").disabled = false;
    $("#item-form-hint").textContent = `Adding a project to: ${portfolio.displayName}`;
}

function render() {
    showPortfolioList();
    showSelectedPortfolio();
}

// ---------- Portfolio create / edit / delete ----------

function portfolioFormData() {
    return {
        displayName: $("#displayName").value.trim(),
        whatIEnjoy: $("#enjoy").value.trim(),
        whatIveTried: $("#tried").value.trim(),
        whatImCuriousAbout: $("#curious").value.trim()
    };
}

function resetPortfolioForm() {
    $("#portfolio-form").reset();
    editingPortfolioId = null;
    $("#portfolio-form-heading").textContent = "Create a Portfolio";
    $("#portfolio-submit").textContent = "Create Portfolio";
    $("#portfolio-cancel").hidden = true;
    $("#portfolio-error").textContent = "";
}

function cancelPortfolioEdit() {
    resetPortfolioForm();
}

$("#portfolio-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = portfolioFormData();
    if (!data.displayName) {
        $("#portfolio-error").textContent = "Please enter a display name.";
        return;
    }

    if (editingPortfolioId) {
        const portfolio = portfolios.find((p) => p.id === editingPortfolioId);
        if (!portfolio) return;
        Object.assign(portfolio, data);
        selectedId = portfolio.id;
    } else {
        const portfolio = { id: makeId(), ...data, items: [] };
        portfolios.push(portfolio);
        selectedId = portfolio.id;
    }

    if (savePortfolios()) {
        resetPortfolioForm();
        render();
    }
});

$("#portfolio-cancel").addEventListener("click", resetPortfolioForm);

$("#edit-portfolio").addEventListener("click", () => {
    const portfolio = selectedPortfolio();
    if (!portfolio) return;
    editingPortfolioId = portfolio.id;
    $("#displayName").value = portfolio.displayName;
    $("#enjoy").value = portfolio.whatIEnjoy;
    $("#tried").value = portfolio.whatIveTried;
    $("#curious").value = portfolio.whatImCuriousAbout;
    $("#portfolio-form-heading").textContent = "Edit Portfolio";
    $("#portfolio-submit").textContent = "Save Changes";
    $("#portfolio-cancel").hidden = false;
    $("#portfolio-error").textContent = "";
    $("#displayName").focus();
});

$("#delete-portfolio").addEventListener("click", () => {
    const portfolio = selectedPortfolio();
    if (!portfolio) return;
    const itemCount = portfolio.items.length;
    const message = itemCount
        ? `Delete "${portfolio.displayName}" and all ${itemCount} item(s) inside it? This cannot be undone.`
        : `Delete "${portfolio.displayName}"? This cannot be undone.`;
    if (!confirm(message)) return;

    portfolios = portfolios.filter((p) => p.id !== portfolio.id);
    selectedId = portfolios[0]?.id ?? null;
    resetPortfolioForm();
    cancelItemEdit();
    savePortfolios();
    render();
});

// ---------- Portfolio Item create / edit / delete ----------

function itemFormData() {
    const form = new FormData($("#item-form"));
    return {
        title: String(form.get("title") || "").trim(),
        type: String(form.get("type") || "").trim(),
        date: String(form.get("date") || ""),
        role: String(form.get("role") || "").trim(),
        description: String(form.get("description") || "").trim(),
        skills: String(form.get("skills") || "").split(",").map((skill) => skill.trim()).filter(Boolean),
        whatIDid: String(form.get("whatIDid") || "").trim(),
        whatILearned: String(form.get("whatILearned") || "").trim(),
        challenge: String(form.get("challenge") || "").trim(),
        nextStep: String(form.get("nextStep") || "").trim(),
        evidence: String(form.get("evidence") || "").trim() ? [String(form.get("evidence")).trim()] : []
    };
}

function fillItemForm(item) {
    $("#title").value = item.title;
    $("#type").value = item.type;
    $("#date").value = item.date;
    $("#role").value = item.role;
    $("#skills").value = item.skills.join(", ");
    $("#description").value = item.description;
    $("#whatIDid").value = item.whatIDid;
    $("#whatILearned").value = item.whatILearned;
    $("#challenge").value = item.challenge;
    $("#nextStep").value = item.nextStep;
    $("#evidence").value = item.evidence[0] || "";
}

function resetItemForm() {
    $("#item-form").reset();
    editingItemId = null;
    $("#item-form-heading").textContent = "Add a Portfolio Item";
    $("#item-submit").textContent = "Add Item";
    $("#item-cancel").hidden = true;
    $("#item-error").textContent = "";
}

function cancelItemEdit() {
    resetItemForm();
}

function beginItemEdit(itemId) {
    const portfolio = selectedPortfolio();
    const item = portfolio?.items.find((entry) => entry.id === itemId);
    if (!item) return;
    editingItemId = item.id;
    fillItemForm(item);
    $("#item-form-heading").textContent = "Edit a Portfolio Item";
    $("#item-submit").textContent = "Save Changes";
    $("#item-cancel").hidden = false;
    $("#item-error").textContent = "";
    $("#item-form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    $("#title").focus({ preventScroll: true });
}

$("#item-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const portfolio = selectedPortfolio();
    if (!portfolio) {
        $("#item-error").textContent = "Choose a Portfolio first.";
        return;
    }

    const data = itemFormData();
    if (!data.title) {
        $("#item-error").textContent = "Please enter a title.";
        return;
    }

    if (data.evidence.length) {
        try {
            const url = new URL(data.evidence[0]);
            if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
            $("#item-error").textContent = "Please enter a valid http:// or https:// evidence link.";
            return;
        }
    }

    if (editingItemId) {
        const item = portfolio.items.find((entry) => entry.id === editingItemId);
        if (!item) return;
        Object.assign(item, data);
    } else {
        portfolio.items.push({ id: makeId(), ...data });
    }

    if (savePortfolios()) {
        resetItemForm();
        render();
    }
});

$("#item-cancel").addEventListener("click", resetItemForm);

function deleteItem(itemId) {
    const portfolio = selectedPortfolio();
    const item = portfolio?.items.find((entry) => entry.id === itemId);
    if (!portfolio || !item) return;
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    portfolio.items = portfolio.items.filter((entry) => entry.id !== itemId);
    if (editingItemId === itemId) resetItemForm();
    savePortfolios();
    render();
}

// Initial page load
render();
