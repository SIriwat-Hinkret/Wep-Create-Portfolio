// ==========================================
// challenge.js
// Create and download Challenge Item JSON
// ==========================================

// 1. Add modal CSS styles
const challengeStyle = document.createElement("style");
challengeStyle.textContent = `
    #challenge-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 1050;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 1.5rem 1rem;
        overflow-y: auto;
    }
    #challenge-overlay[hidden] {
        display: none;
    }
    #challenge-dialog {
        background: #ffffff;
        color: #26323a;
        border-radius: 1rem;
        width: 100%;
        max-width: 650px;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(challengeStyle);

// 2. Add modal HTML structure for Challenge Item
const challengeOverlay = document.createElement("div");
challengeOverlay.id = "challenge-overlay";
challengeOverlay.hidden = true;
challengeOverlay.innerHTML = `
    <div id="challenge-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-title">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h2 class="h5 fw-bold mb-0" id="challenge-title">Create Challenge Item (JSON)</h2>
            <button type="button" class="btn-close" id="ch-close-btn" aria-label="Close"></button>
        </div>
        <p class="small text-muted mb-3">Fill in the item details to generate and download a .json file for importing.</p>

        <form id="challenge-item-form">
            <div class="row g-2 mb-2">
                <div class="col-md-8">
                    <label class="form-label small fw-semibold" for="ch-title">Title *</label>
                    <input class="form-control" id="ch-title" required placeholder="e.g. Web Development Challenge">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold" for="ch-type">Type</label>
                    <input class="form-control" id="ch-type" value="Challenge" placeholder="Challenge">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold" for="ch-date">Date</label>
                    <input class="form-control" id="ch-date" type="date">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold" for="ch-role">Role</label>
                    <input class="form-control" id="ch-role" placeholder="e.g. Participant / Developer">
                </div>
                <div class="col-12">
                    <label class="form-label small fw-semibold" for="ch-skills">Skills (comma separated)</label>
                    <input class="form-control" id="ch-skills" placeholder="e.g. HTML, CSS, JavaScript">
                </div>
                <div class="col-12">
                    <label class="form-label small fw-semibold" for="ch-desc">Description</label>
                    <textarea class="form-control" id="ch-desc" rows="2" placeholder="Brief description of the challenge or project"></textarea>
                </div>
            </div>

            <p class="small fw-semibold mt-3 mb-1 text-primary">Reflection</p>
            <div class="row g-2 mb-2">
                <div class="col-md-6">
                    <label class="form-label small" for="ch-whatIDid">What I did</label>
                    <textarea class="form-control" id="ch-whatIDid" rows="2" placeholder="What you worked on"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label small" for="ch-whatILearned">What I learned</label>
                    <textarea class="form-control" id="ch-whatILearned" rows="2" placeholder="Key takeaways and lessons"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label small" for="ch-challenge">Challenge</label>
                    <textarea class="form-control" id="ch-challenge" rows="2" placeholder="Obstacles and how you solved them"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label small" for="ch-nextStep">Next step</label>
                    <textarea class="form-control" id="ch-nextStep" rows="2" placeholder="Future goals and next steps"></textarea>
                </div>
            </div>

            <div class="row g-2 mb-3">
                <div class="col-md-8">
                    <label class="form-label small fw-semibold" for="ch-evidence">Evidence Link</label>
                    <input class="form-control" id="ch-evidence" type="url" placeholder="https://example.com/project">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold" for="ch-category">Category</label>
                    <select class="form-select" id="ch-category">
                        <option value="discover">discover</option>
                        <option value="mix">mix</option>
                        <option value="levelup">levelup</option>
                    </select>
                </div>
            </div>

            <div class="d-flex gap-2 mt-3">
                <button type="submit" class="btn btn-success flex-grow-1" id="ch-submit-btn">Download JSON File</button>
                <button type="button" class="btn btn-outline-secondary" id="ch-cancel-btn">Cancel</button>
            </div>
        </form>
    </div>
`;
document.body.appendChild(challengeOverlay);

// 3. Open and close modal functions
function openChallengeModal() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById("ch-date").value = today;
    challengeOverlay.hidden = false;
    document.getElementById("ch-title").focus();
}

function closeChallengeModal() {
    challengeOverlay.hidden = true;
    document.getElementById("challenge-item-form").reset();
}

// 4. Bind open button (supports challenge-json and challenge-btn)
const openBtn = document.getElementById("challenge-json") || document.getElementById("challenge-btn");
if (openBtn) {
    openBtn.addEventListener("click", openChallengeModal);
}

// Bind close and cancel buttons
document.getElementById("ch-close-btn").addEventListener("click", closeChallengeModal);
document.getElementById("ch-cancel-btn").addEventListener("click", closeChallengeModal);

// Click outside to close modal
challengeOverlay.addEventListener("mousedown", function (event) {
    if (event.target === challengeOverlay) {
        closeChallengeModal();
    }
});

// 5. Handle form submission to download JSON file
const challengeForm = document.getElementById("challenge-item-form");

challengeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get values from inputs
    const title = document.getElementById("ch-title").value.trim();
    const type = document.getElementById("ch-type").value.trim() || "Challenge";
    const date = document.getElementById("ch-date").value || new Date().toISOString().slice(0, 10);
    const role = document.getElementById("ch-role").value.trim() || "Participant";
    const desc = document.getElementById("ch-desc").value.trim() || "-";
    const skillsText = document.getElementById("ch-skills").value.trim();
    const whatIDid = document.getElementById("ch-whatIDid").value.trim() || "-";
    const whatILearned = document.getElementById("ch-whatILearned").value.trim() || "-";
    const challenge = document.getElementById("ch-challenge").value.trim() || "-";
    const nextStep = document.getElementById("ch-nextStep").value.trim() || "-";
    const evidenceUrl = document.getElementById("ch-evidence").value.trim();
    const category = document.getElementById("ch-category").value;

    // Convert skills comma-separated text into array
    let skills = [];
    if (skillsText) {
        skills = skillsText.split(",").map(function (item) {
            return item.trim();
        }).filter(function (item) {
            return item !== "";
        });
    }

    // Convert evidence to array
    let evidence = [];
    if (evidenceUrl) {
        evidence.push(evidenceUrl);
    } else {
        evidence.push("https://github.com/SIriwat-Hinkret/Wep-Create-Portfolio");
    }

    // Build Challenge JSON object
    const challengeJsonData = {
        id: "challenge-" + Date.now(),
        title: title,
        type: type,
        date: date,
        role: role,
        description: desc,
        skills: skills,
        reflection: {
            whatIDid: whatIDid,
            whatILearned: whatILearned,
            challenge: challenge,
            nextStep: nextStep
        },
        evidence: evidence,
        challengeId: "ch-" + Math.floor(Math.random() * 1000),
        hostGroup: "Booth Host",
        category: category,
        schemaVersion: "1.0"
    };

    // Convert to formatted JSON string
    const jsonString = JSON.stringify(challengeJsonData, null, 2);

    // Create Blob for file download
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });

    // Safe filename
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9_-]+/gi, "-");
    const filename = (safeTitle || "challenge") + ".json";

    // Create link and trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Alert user and close modal
    alert("Created and downloaded " + filename + " successfully!");
    closeChallengeModal();
});
