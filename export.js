(() => {
    "use strict";


    function buildExportData(portfolio) {
        return {
            id: portfolio.id,
            displayName: portfolio.displayName,
            whatIEnjoy: portfolio.whatIEnjoy,
            whatIveTried: portfolio.whatIveTried,
            whatImCuriousAbout: portfolio.whatImCuriousAbout,
            exportedAt: new Date().toISOString(),
            items: portfolio.items.map((item) => {
              
                const formattedItem = {
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    date: item.date,
                    role: item.role,
                    description: item.description,
                    skills: item.skills,
                    reflection: {
                        whatIDid: item.whatIDid,
                        whatILearned: item.whatILearned,
                        challenge: item.challenge,
                        nextStep: item.nextStep
                    },
                    evidence: item.evidence
                };

               
                for (const key of ["challengeId", "hostGroup", "category", "schemaVersion"]) {
                    if (item[key]) {
                        formattedItem[key] = item[key];
                    }
                }

                return formattedItem;
            })
        };
    }

  
    const style = document.createElement("style");
    style.textContent = `
        #export-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1050;display:flex;
            align-items:flex-start;justify-content:center;padding:1.5rem 1rem;overflow-y:auto}
        #export-overlay[hidden]{display:none}
        #export-dialog{background:#fff;color:#26323a;border-radius:1rem;width:100%;max-width:720px;padding:1.5rem}
        #export-dialog textarea{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.85rem;background:#f8f9fa}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "export-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <div id="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h2 class="h5 fw-bold mb-0" id="export-title">Export Portfolio</h2>
                <button type="button" class="btn-close" id="export-close" aria-label="Close"></button>
            </div>
            <p class="small text-muted mb-2" id="export-subtitle">JSON structure for this portfolio:</p>

            <textarea class="form-control mb-3" id="export-text" rows="14" readonly></textarea>

            <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-success flex-grow-1" id="export-download">Download .json file</button>
                <button type="button" class="btn btn-outline-primary" id="export-copy">Copy JSON</button>
                <button type="button" class="btn btn-outline-secondary" id="export-cancel">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const q = (sel) => overlay.querySelector(sel);
    let currentPortfolio = null;
    let currentJsonString = "";

   
    function openExport() {
        
        const portfolio = typeof selectedPortfolio === "function" ? selectedPortfolio() : null;
        if (!portfolio) {
            alert("Please select a Portfolio first.");
            return;
        }

        currentPortfolio = portfolio;
        const exportObj = buildExportData(portfolio);
        currentJsonString = JSON.stringify(exportObj, null, 2); 

        q("#export-subtitle").textContent = `JSON data for "${portfolio.displayName}" (${portfolio.items.length} items):`;
        q("#export-text").value = currentJsonString;
        q("#export-copy").textContent = "Copy JSON";

        overlay.hidden = false;
        q("#export-text").focus();
        q("#export-text").select();
    }

    function closeExport() {
        overlay.hidden = true;
        currentPortfolio = null;
        currentJsonString = "";
    }

    function downloadJsonFile() {
        if (!currentPortfolio || !currentJsonString) return;

      
        const safeName = (currentPortfolio.displayName || "portfolio")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9ก-๙_-]+/gi, "-")
            .replace(/^-+|-+$/g, "") || "portfolio";

        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `${safeName}-${dateStr}.json`;

        const blob = new Blob([currentJsonString], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function copyJsonText() {
        if (!currentJsonString) return;
        const btn = q("#export-copy");
        try {
            await navigator.clipboard.writeText(currentJsonString);
            btn.textContent = "Copied!";
            setTimeout(() => {
                btn.textContent = "Copy JSON";
            }, 2000);
        } catch {
            
            q("#export-text").select();
            document.execCommand("copy");
            btn.textContent = "Copied!";
            setTimeout(() => {
                btn.textContent = "Copy JSON";
            }, 2000);
        }
    }

   
    const exportBtn = document.querySelector("#export-portfolio");
    if (exportBtn) {
        exportBtn.addEventListener("click", openExport);
    }

    q("#export-close").addEventListener("click", closeExport);
    q("#export-cancel").addEventListener("click", closeExport);
    q("#export-download").addEventListener("click", downloadJsonFile);
    q("#export-copy").addEventListener("click", copyJsonText);

    overlay.addEventListener("mousedown", (e) => {
        if (e.target === overlay) closeExport();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overlay.hidden) closeExport();
    });
})();