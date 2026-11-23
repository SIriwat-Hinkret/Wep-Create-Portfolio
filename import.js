(() => {
    "use strict";

    const CATEGORIES = ["discover", "mix", "levelup"];
    const MAX_SHORT = 200;     // title, type, role, ids
    const MAX_LONG = 2000;     // description, reflection
    const MAX_SKILLS = 30;
    const MAX_EVIDENCE = 10;
    const MAX_JSON_CHARS = 20000;

    // ---------------------------------------------------------------
    // 1) Validation: JSON text -> { errors, item }
    // ---------------------------------------------------------------
    const isStr = (v) => typeof v === "string";
    const isNonEmpty = (v) => isStr(v) && v.trim() !== "";
    const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

    function isValidDate(s) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
        const d = new Date(`${s}T00:00:00Z`);
        return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
    }

    function isHttpUrl(s) {
        try {
            const u = new URL(s);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    }

    function parseAndValidate(text) {
        const errors = [];

        if (!text.trim()) return { errors: ["Please paste the Portfolio Item JSON first."], item: null };
        if (text.length > MAX_JSON_CHARS) return { errors: ["JSON is too large."], item: null };

        let raw;
        try {
            raw = JSON.parse(text);
        } catch (e) {
            return { errors: [`Invalid JSON format: ${e.message}`], item: null };
        }

        if (Array.isArray(raw)) {
            return { errors: ["Please paste ONE Portfolio Item (a JSON object), not a list."], item: null };
        }
        if (!isPlainObject(raw)) {
            return { errors: ["The JSON must be an object like { \"id\": ..., \"title\": ... }."], item: null };
        }

        // --- string fields
        for (const key of ["id", "title", "type", "date"]) {
            if (!isNonEmpty(raw[key])) errors.push(`"${key}" is required and must be text.`);
        }
        for (const key of ["role", "description"]) {
            if (!isStr(raw[key])) errors.push(`"${key}" is required and must be text.`);
        }
        if (isStr(raw.id) && raw.id.length > MAX_SHORT) errors.push(`"id" is too long.`);
        if (isStr(raw.title) && raw.title.length > MAX_SHORT) errors.push(`"title" is too long (max ${MAX_SHORT}).`);
        if (isStr(raw.type) && raw.type.length > MAX_SHORT) errors.push(`"type" is too long.`);
        if (isStr(raw.role) && raw.role.length > MAX_SHORT) errors.push(`"role" is too long.`);
        if (isStr(raw.description) && raw.description.length > MAX_LONG) errors.push(`"description" is too long.`);
        if (isNonEmpty(raw.date) && !isValidDate(raw.date)) {
            errors.push(`"date" must be a real date in YYYY-MM-DD format (e.g. 2026-11-24).`);
        }

        // --- skills: string[]
        if (!Array.isArray(raw.skills) || !raw.skills.every(isStr)) {
            errors.push(`"skills" must be a list of text, e.g. ["HTML", "CSS"].`);
        } else if (raw.skills.length > MAX_SKILLS) {
            errors.push(`"skills" has too many entries (max ${MAX_SKILLS}).`);
        }

        // --- reflection: object with 4 strings
        const reflectionKeys = ["whatIDid", "whatILearned", "challenge", "nextStep"];
        if (!isPlainObject(raw.reflection)) {
            errors.push(`"reflection" must be an object with whatIDid, whatILearned, challenge, nextStep.`);
        } else {
            for (const key of reflectionKeys) {
                if (!isStr(raw.reflection[key])) {
                    errors.push(`"reflection.${key}" is required and must be text.`);
                } else if (raw.reflection[key].length > MAX_LONG) {
                    errors.push(`"reflection.${key}" is too long.`);
                }
            }
        }

        // --- evidence: string[] with >= 1 valid URL
        if (!Array.isArray(raw.evidence) || !raw.evidence.every(isStr)) {
            errors.push(`"evidence" must be a list of URLs, e.g. ["https://example.com"].`);
        } else if (raw.evidence.length === 0) {
            errors.push(`"evidence" must contain at least 1 URL.`);
        } else if (raw.evidence.length > MAX_EVIDENCE) {
            errors.push(`"evidence" has too many links (max ${MAX_EVIDENCE}).`);
        } else if (!raw.evidence.every((u) => isHttpUrl(u.trim()))) {
            errors.push(`Every "evidence" link must be a valid http:// or https:// URL.`);
        }

        // --- optional metadata
        for (const key of ["challengeId", "hostGroup", "category", "schemaVersion"]) {
            if (raw[key] !== undefined && !isStr(raw[key])) errors.push(`"${key}" must be text if provided.`);
        }
        if (isStr(raw.category) && raw.category !== "" && !CATEGORIES.includes(raw.category)) {
            errors.push(`"category" must be one of: ${CATEGORIES.join(", ")}.`);
        }

        if (errors.length) return { errors, item: null };

        // --- build internal item (โครงสร้างแบบเดียวกับที่ script.js ใช้อยู่: reflection แบนเป็น field)
        const item = {
            id: raw.id.trim(),
            title: raw.title.trim(),
            type: raw.type.trim(),
            date: raw.date,
            role: raw.role.trim(),
            description: raw.description.trim(),
            skills: raw.skills.map((s) => s.trim()).filter(Boolean),
            whatIDid: raw.reflection.whatIDid.trim(),
            whatILearned: raw.reflection.whatILearned.trim(),
            challenge: raw.reflection.challenge.trim(),
            nextStep: raw.reflection.nextStep.trim(),
            evidence: raw.evidence.map((u) => u.trim())
        };
        for (const key of ["challengeId", "hostGroup", "category", "schemaVersion"]) {
            if (isNonEmpty(raw[key])) item[key] = raw[key].trim();
        }
        return { errors: [], item };
    }

    // ---------------------------------------------------------------
    // 2) Duplicate check (กัน ID ซ้ำ ข้ามทุก Portfolio)
    // ---------------------------------------------------------------
    function findPortfolioWithItem(id) {
        return portfolios.find((p) => p.items.some((it) => it.id === id)) || null;
    }

    // ---------------------------------------------------------------
    // 3) UI 
    // ---------------------------------------------------------------
    const style = document.createElement("style");
    style.textContent = `
        #import-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1050;display:flex;
            align-items:flex-start;justify-content:center;padding:1.5rem 1rem;overflow-y:auto}
        #import-overlay[hidden]{display:none}
        #import-dialog{background:#fff;color:#26323a;border-radius:1rem;width:100%;max-width:720px;padding:1.5rem}
        #import-dialog .imp-preview-row{margin-bottom:.35rem;overflow-wrap:anywhere}
        #import-dialog .imp-errors{margin:0;padding-left:1.1rem}
        #import-dialog textarea{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.85rem}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "import-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <div id="import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h2 class="h5 fw-bold mb-0" id="import-title">Import Portfolio Item</h2>
                <button type="button" class="btn-close" id="import-close" aria-label="Close"></button>
            </div>
            <p class="small text-muted">Paste the Portfolio Item JSON you received from the booth host (or choose a .json file), then press "Check JSON".</p>

            <textarea class="form-control mb-2" id="import-text" rows="8" placeholder='{ "id": "...", "title": "...", ... }'></textarea>
            <div class="d-flex flex-wrap gap-2 mb-2">
                <button type="button" class="btn btn-primary btn-sm" id="import-check">Check JSON</button>
                <label class="btn btn-outline-secondary btn-sm mb-0" for="import-file">Choose .json file</label>
                <input type="file" id="import-file" accept=".json,application/json" hidden>
                <button type="button" class="btn btn-outline-secondary btn-sm" id="import-clear">Clear</button>
            </div>

            <div class="alert alert-danger py-2 small" id="import-errors" role="alert" hidden></div>

            <div id="import-review" hidden>
                <hr>
                <h3 class="h6 fw-bold">Review item</h3>
                <div class="small mb-3" id="import-summary"></div>

                <label class="form-label small fw-semibold" for="import-target">Save into Portfolio</label>
                <select class="form-select mb-3" id="import-target"></select>

                <p class="small fw-semibold mb-1">Reflection (edit so it matches what you actually did)</p>
                <label class="form-label small" for="imp-whatIDid">What I did</label>
                <textarea class="form-control mb-2" id="imp-whatIDid" rows="2"></textarea>
                <label class="form-label small" for="imp-whatILearned">What I learned</label>
                <textarea class="form-control mb-2" id="imp-whatILearned" rows="2"></textarea>
                <label class="form-label small" for="imp-challenge">Challenge</label>
                <textarea class="form-control mb-2" id="imp-challenge" rows="2"></textarea>
                <label class="form-label small" for="imp-nextStep">Next step</label>
                <textarea class="form-control mb-3" id="imp-nextStep" rows="2"></textarea>

                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-success flex-grow-1" id="import-save">Save to Portfolio</button>
                    <button type="button" class="btn btn-outline-secondary" id="import-cancel">Cancel</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    const q = (sel) => overlay.querySelector(sel);
    let pendingItem = null;   // item ที่ผ่าน validation แล้ว รอ Save
    let saving = false;

    function showErrors(messages) {
        const box = q("#import-errors");
        box.replaceChildren();
        if (!messages.length) {
            box.hidden = true;
            return;
        }
        const ul = document.createElement("ul");
        ul.className = "imp-errors";
        messages.forEach((m) => {
            const li = document.createElement("li");
            li.textContent = m;
            ul.appendChild(li);
        });
        box.appendChild(ul);
        box.hidden = false;
    }

    function resetImportDialog() {
        pendingItem = null;
        q("#import-text").value = "";
        q("#import-file").value = "";
        q("#import-review").hidden = true;
        showErrors([]);
    }

    function openImport() {
        resetImportDialog();
        overlay.hidden = false;
        q("#import-text").focus();
    }

    function closeImport() {
        overlay.hidden = true;
        resetImportDialog();
    }

    function addSummaryRow(label, value) {
        const row = document.createElement("div");
        row.className = "imp-preview-row";
        const b = document.createElement("strong");
        b.textContent = `${label}: `;
        row.append(b, document.createTextNode(value || "—"));
        q("#import-summary").appendChild(row);
    }

    function showReview(item) {
        const summary = q("#import-summary");
        summary.replaceChildren();
        addSummaryRow("Title", item.title);
        addSummaryRow("Type", item.type);
        addSummaryRow("Date", item.date);
        addSummaryRow("Role", item.role);
        addSummaryRow("Description", item.description);
        addSummaryRow("Skills", item.skills.join(", "));
        addSummaryRow("Evidence", item.evidence.join(", "));
        if (item.hostGroup) addSummaryRow("Host group", item.hostGroup);
        if (item.challengeId) addSummaryRow("Challenge", item.challengeId);
        if (item.category) addSummaryRow("Category", item.category);

        const select = q("#import-target");
        select.replaceChildren();
        portfolios.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.displayName;
            if (p.id === selectedId) opt.selected = true;
            select.appendChild(opt);
        });

        q("#imp-whatIDid").value = item.whatIDid;
        q("#imp-whatILearned").value = item.whatILearned;
        q("#imp-challenge").value = item.challenge;
        q("#imp-nextStep").value = item.nextStep;
        q("#import-review").hidden = false;
        q("#import-review").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // --- Step 1: Check JSON
    function checkJson() {
        pendingItem = null;
        q("#import-review").hidden = true;

        if (!portfolios.length) {
            showErrors(["Please create a Portfolio first, then import the item into it."]);
            return;
        }

        const { errors, item } = parseAndValidate(q("#import-text").value);
        if (errors.length) {
            showErrors(errors);
            return;
        }

        const dup = findPortfolioWithItem(item.id);
        if (dup) {
            showErrors([`This item (id "${item.id}") was already imported into "${dup.displayName}". Duplicate imports are not allowed.`]);
            return;
        }

        showErrors([]);
        pendingItem = item;
        showReview(item);
    }

    // --- Step 2: Save
    async function saveImported() {
        if (saving || !pendingItem) return;

        const portfolio = portfolios.find((p) => p.id === q("#import-target").value);
        if (!portfolio) {
            showErrors(["Please choose a destination Portfolio."]);
            return;
        }

        const reflection = {
            whatIDid: q("#imp-whatIDid").value.trim(),
            whatILearned: q("#imp-whatILearned").value.trim(),
            challenge: q("#imp-challenge").value.trim(),
            nextStep: q("#imp-nextStep").value.trim()
        };
        const labels = { whatIDid: "What I did", whatILearned: "What I learned", challenge: "Challenge", nextStep: "Next step" };
        const errors = [];
        for (const [key, value] of Object.entries(reflection)) {
            if (!value) errors.push(`Please fill in "${labels[key]}".`);
            else if (value.length > MAX_LONG) errors.push(`"${labels[key]}" is too long (max ${MAX_LONG}).`);
        }
        if (findPortfolioWithItem(pendingItem.id)) {
            errors.push(`This item (id "${pendingItem.id}") already exists. Duplicate imports are not allowed.`);
        }
        if (errors.length) {
            showErrors(errors);
            return;
        }

        saving = true;
        q("#import-save").disabled = true;
        try {
            // M13-compatible import endpoint: sends JSON + persistent fingerprint.
            const sourceObject = {
                id: pendingItem.id,
                title: pendingItem.title,
                type: pendingItem.type,
                date: pendingItem.date,
                role: pendingItem.role,
                description: pendingItem.description,
                skills: pendingItem.skills,
                reflection,
                evidence: pendingItem.evidence
            };
            for (const key of ["challengeId", "hostGroup", "category", "schemaVersion"]) {
                if (pendingItem[key]) sourceObject[key] = pendingItem[key];
            }
            const rawJson = q("#import-text").value;
            const response = await fetch("api/import.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    portfolioId: portfolio.id,
                    data: sourceObject,
                    fileHash: await fingerprint(rawJson),
                    reflection
                })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (response.status === 409) throw new Error(result.error || "Duplicate import blocked.");
                throw new Error(result.error || `Server could not save the item (HTTP ${response.status}).`);
            }

            const importedTitle = pendingItem.title;
            selectedId = portfolio.id;
            await loadPortfolios();
            closeImport();
            alert(`Imported "${importedTitle}" into "${portfolio.displayName}".`);
        } catch (error) {
            console.error("Import save failed:", error);
            showErrors([error.message || "Could not save the imported item. Nothing was changed. Please try again."]);
        } finally {
            saving = false;
            q("#import-save").disabled = false;
        }
    }

    async function fingerprint(value) {
        if (window.crypto && crypto.subtle) {
            const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
            return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
        }
        let hash = 2166136261;
        for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
        return "fnv-" + (hash >>> 0).toString(16);
    }

    // --- Optional: เลือกไฟล์ .json แล้วใส่ลง textarea
    function loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > MAX_JSON_CHARS * 2) {
            showErrors(["That file is too large to be a Portfolio Item."]);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            q("#import-text").value = String(reader.result || "");
            checkJson();
        };
        reader.onerror = () => showErrors(["Could not read that file."]);
        reader.readAsText(file);
    }

    // ---------------------------------------------------------------
    // 4) Wire up events
    // ---------------------------------------------------------------
    document.querySelector("#import-portfolio").addEventListener("click", openImport);
    q("#import-close").addEventListener("click", closeImport);
    q("#import-cancel").addEventListener("click", closeImport);
    q("#import-clear").addEventListener("click", resetImportDialog);
    q("#import-check").addEventListener("click", checkJson);
    q("#import-save").addEventListener("click", saveImported);
    q("#import-file").addEventListener("change", loadFile);
    overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeImport(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) closeImport(); });
    // แก้ JSON ใหม่ → ต้องกด Check ใหม่
    q("#import-text").addEventListener("input", () => {
        pendingItem = null;
        q("#import-review").hidden = true;
    });
})();
