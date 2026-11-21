/* =========================================
   SIGNALTRACE - COMPLETE DATA ENGINE
========================================= */

let cdrRecords = [];
let ipdrRecords = [];
let importHistory = [];
let auditLogs = [];
let selectedFiles = [];
let cdrData = [];
let ipdrData = [];
let importedFiles = [];
let activityChart = null;
let recordChart = null;
let communicationAnalysisChart = null;
/* ==================================
   SHARED IMPORTED FILE DISPLAY
================================== */

function renderImportedFiles() {

    const containers = [
        document.getElementById("dashboard-imported-files"),
        document.getElementById("module-imported-files")
    ];

    containers.forEach(container => {

        if (!container) return;

        container.innerHTML = "";

        if (importHistory.length === 0) {
            container.textContent = "No files imported yet.";
            return;
        }

        importHistory.forEach(item => {

            const fileItem = document.createElement("div");

            fileItem.className = "imported-file-item";

            fileItem.textContent =
                `${item.name} | ${item.type} | ${item.status}`;

            container.appendChild(fileItem);
        });
    });
}

/* =========================================
   ELEMENTS
========================================= */

const navLinks = document.querySelectorAll(".nav-link");
const dashboard = document.getElementById("dashboard");
const moduleView = document.getElementById("module-view");
const pageTitle = document.getElementById("page-title");

const modules = {
    import: ["Data Import", "Upload and normalise telecom records."],
    communication: ["Communication Analysis", "Analyse communication patterns."],
    contacts: ["Common Contacts", "Explore shared contacts across datasets."],
    timeline: ["Tower Timeline", "Explore recorded tower activity."],
    assistant: ["AI Investigation Assistant", "Ask questions about uploaded records."],
    reports: ["Investigation Reports", "Generate analytical reports."],
    audit: ["Audit Logs", "Review system activity."]
};

/* =========================================
   AUDIT LOG
========================================= */

function addAudit(message) {
    auditLogs.unshift({
        time: new Date().toLocaleString(),
        message
    });

    if (auditLogs.length > 100) {
        auditLogs.pop();
    }

    updateAuditPage();
}

/* =========================================
   NAVIGATION
========================================= */

navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const section = link.dataset.section;

        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        if (section === "dashboard") {
            dashboard.style.display = "block";
            moduleView.style.display = "none";
            pageTitle.textContent = "Dashboard Overview";

            updateDashboard();
            return;
        }

        dashboard.style.display = "none";
        moduleView.style.display = "block";

        if (!modules[section]) return;

        pageTitle.textContent = modules[section][0];

        renderModule(section);
    });
});

/* =========================================
   MODULE PAGE RENDERER
========================================= */

function renderModule(section) {

if (section === "import") {
    moduleView.innerHTML = `
        <div class="welcome-section">
            <h1>Import Telecom Records</h1>
            <p>Upload CDR and IPDR CSV files for analysis.</p>
        </div>

        <div class="import-panel">
            <div class="upload-area">
                <input
                    type="file"
                    id="module-csv-files"
                    accept=".csv,text/csv"
                    multiple
                >

                <button id="module-upload-button" type="button">
                    Upload & Analyse
                </button>

                <ul id="module-selected-files"></ul>
            </div>

            <p id="module-upload-status">
                Previously imported files will appear below.
            </p>
        </div>

        <div class="table-card">
            <h3>Imported Files</h3>
            <div id="module-imported-files"></div>
        </div>
    `;

    bindUploadControls(
        "module-csv-files",
        "module-upload-button",
        "module-upload-status",
        "module-selected-files"
    );
    renderImportedFiles();

    const importedContainer =
        document.getElementById("module-imported-files");

    importedContainer.innerHTML = "";

    if (importHistory.length === 0) {
        importedContainer.textContent = "No files imported yet.";
    } else {
        importHistory.forEach(item => {
            const file = document.createElement("p");

            file.textContent =
                `${item.name} — ${item.type} — ${item.status}`;

            importedContainer.appendChild(file);
        });
    }

} 
    else if (section === "communication") {
        moduleView.innerHTML = `
            <div class="welcome-section">
                <h1>Communication Analysis</h1>
                <p>Analyse communication patterns between subscribers.</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Calls</p>
                    <h2 id="communication-total-calls">0</h2>
                </div>

                <div class="stat-card">
                    <p>Unique Numbers</p>
                    <h2 id="unique-numbers">0</h2>
                </div>

                <div class="stat-card">
                    <p>Frequent Contacts</p>
                    <h2 id="frequent-contacts">0</h2>
                </div>
            </div>

            <div class="chart-card">
                <h3>Communication Activity</h3>
                <canvas id="communicationNetworkChart"></canvas>
            </div>

            <div class="table-card">
                <h3>Communication Records</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Caller</th>
                            <th>Receiver</th>
                            <th>Date / Time</th>
                            <th>Duration</th>
                            <th>Tower</th>
                        </tr>
                    </thead>
                    <tbody id="communication-table"></tbody>
                </table>
            </div>
        `;

        updateCommunicationAnalysis();
    }

    else if (section === "contacts") {
        moduleView.innerHTML = `
            <div class="welcome-section">
                <h1>Common Contacts</h1>
                <p>Find contacts shared by multiple callers.</p>
            </div>

            <p id="contacts-message">Import CDR records to begin.</p>

            <div class="table-card" id="common-contacts-table"></div>
        `;

        updateCommonContacts();
    }

    else if (section === "timeline") {
        moduleView.innerHTML = `
            <div class="welcome-section">
                <h1>Tower Timeline</h1>
                <p>View recorded tower activity in chronological order.</p>
            </div>

            <p id="timeline-message"></p>

            <div class="table-card">
                <table>
                    <thead>
                        <tr>
                            <th>Subscriber</th>
                            <th>Date / Time</th>
                            <th>Tower ID</th>
                            <th>Contact</th>
                        </tr>
                    </thead>
                    <tbody id="timeline-table"></tbody>
                </table>
            </div>
        `;

        updateTimeline();
    }

    else if (section === "assistant") {
        moduleView.innerHTML = `
            <div class="welcome-section">
                <h1>AI Investigation Assistant</h1>
                <p>Ask questions about the imported sample records.</p>
            </div>

            <div class="import-panel">
                <textarea
                    id="assistant-question"
                    placeholder="Example: How many total records are imported?"
                    rows="4"
                ></textarea>

                <button id="ask-assistant" type="button">
                    Ask Question
                </button>

                <div id="assistant-response" class="assistant-response">
                    Your answer will appear here.
                </div>
            </div>
        `;
    }

    else if (section === "reports") {
        moduleView.innerHTML = `
            <div class="welcome-section">
                <h1>Investigation Reports</h1>
                <p>Generate a summary of the imported sample records.</p>
            </div>

            <div class="import-panel">
                <button id="generate-report" type="button">
                    Generate Report
                </button>

                <div id="report-output"></div>
            </div>
        `;
    }

    else if (section === "audit") {
        moduleView.innerHTML = `
            <div class="welcome-section">
                <h1>Audit Logs</h1>
                <p>Review recent actions performed in SignalTrace.</p>
            </div>

            <div class="table-card">
                <table>
                    <thead>
                        <tr>
                            <th>Date / Time</th>
                            <th>Activity</th>
                        </tr>
                    </thead>
                    <tbody id="audit-table"></tbody>
                </table>
            </div>
        `;

        updateAuditPage();
    }
}

/* =========================================
   CSV PARSER
========================================= */

function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (insideQuotes && text[i + 1] === '"') {
                value += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        }

        else if (char === "," && !insideQuotes) {
            row.push(value.trim());
            value = "";
        }

        else if ((char === "\n" || char === "\r") && !insideQuotes) {
            if (char === "\r" && text[i + 1] === "\n") i++;

            row.push(value.trim());

            if (row.some(cell => cell !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";
        }

        else {
            value += char;
        }
    }

    if (value !== "" || row.length > 0) {
        row.push(value.trim());

        if (row.some(cell => cell !== "")) {
            rows.push(row);
        }
    }

    if (rows.length < 2) {
        throw new Error("CSV file contains no data rows.");
    }

    const headers = rows[0].map(header =>
        header.replace(/^\uFEFF/, "").trim()
    );

    return rows.slice(1).map((values, index) => {
        const record = {};

        headers.forEach((header, i) => {
            record[header] = values[i] ?? "";
        });

        record._sourceRow = index + 2;

        return record;
    });
}

/* =========================================
   HEADER HELPERS
========================================= */

function cleanHeader(header) {
    return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getField(record, aliases) {
    const keys = Object.keys(record);

    for (const alias of aliases) {
        const match = keys.find(key =>
            cleanHeader(key) === cleanHeader(alias)
        );

        if (match) return String(record[match]).trim();
    }

    return "";
}

/* =========================================
   FILE TYPE DETECTION
========================================= */

function detectFileType(record) {
    const keys = Object.keys(record).map(cleanHeader);

    if (
        keys.includes("subscriberid") &&
        keys.includes("publicip") &&
        keys.includes("sessionstart")
    ) {
        return "IPDR";
    }

    if (
        keys.includes("callerid") ||
        keys.includes("aparty")
    ) {
        return "CDR";
    }

    throw new Error("Unsupported CSV format. Check the column headers.");
}

/* =========================================
   DURATION HELPER
========================================= */

function parseDuration(value) {
    if (/^\d+:\d{1,2}:\d{1,2}$/.test(value)) {
        const parts = value.split(":").map(Number);
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return Number(value);
}

/* =========================================
   CDR NORMALISATION
========================================= */

function normaliseCDR(record, fileName) {
    const caller = getField(record, [
        "caller_id", "A_Party", "caller", "calling_number"
    ]);

    const receiver = getField(record, [
        "receiver_id", "B_Party", "receiver", "called_number"
    ]);

    const timestamp = getField(record, [
        "call_timestamp", "Start_Date", "timestamp", "call_date"
    ]);

    const durationValue = getField(record, [
        "duration_seconds", "Call_Duration", "duration"
    ]);

    const tower = getField(record, [
        "cell_tower_id", "Cell_ID", "tower_id"
    ]);

    const imei = getField(record, ["device_imei", "IMEI"]);
    const sim = getField(record, ["sim_id", "IMSI"]);

    const duration = parseDuration(durationValue);

    if (!caller || !receiver || !timestamp || durationValue === "") {
        throw new Error(`Missing required CDR fields at row ${record._sourceRow}.`);
    }

    if (
        !Number.isFinite(duration) ||
        duration < 0 ||
        Number.isNaN(Date.parse(timestamp))
    ) {
        throw new Error(`Invalid CDR value at row ${record._sourceRow}.`);
    }

    return {
        caller,
        receiver,
        timestamp,
        duration,
        tower,
        imei,
        sim,
        sourceFile: fileName,
        sourceRow: record._sourceRow
    };
}

/* =========================================
   IPDR NORMALISATION
========================================= */

function normaliseIPDR(record, fileName) {
    const subscriber = getField(record, ["subscriber_id"]);
    const publicIP = getField(record, ["public_ip"]);
    const port = getField(record, ["source_port"]);
    const start = getField(record, ["session_start"]);
    const end = getField(record, ["session_end"]);
    const bytes = getField(record, ["bytes_used"]);

    if (!subscriber || !publicIP || !port || !start || !end || bytes === "") {
        throw new Error(`Missing required IPDR fields at row ${record._sourceRow}.`);
    }

    if (
        !Number.isInteger(Number(port)) ||
        Number(port) < 1 ||
        Number(port) > 65535 ||
        !Number.isFinite(Number(bytes)) ||
        Number(bytes) < 0 ||
        Number.isNaN(Date.parse(start)) ||
        Number.isNaN(Date.parse(end)) ||
        Date.parse(end) < Date.parse(start)
    ) {
        throw new Error(`Invalid IPDR value at row ${record._sourceRow}.`);
    }

    return {
        subscriber,
        publicIP,
        port,
        start,
        end,
        bytes: Number(bytes),
        sourceFile: fileName,
        sourceRow: record._sourceRow
    };
}

/* =========================================
   UPLOAD CONTROLS
========================================= */

function bindUploadControls(inputId, buttonId, statusId, listId) {
    const fileInput = document.getElementById(inputId);
    const uploadButton = document.getElementById(buttonId);
    const uploadStatus = document.getElementById(statusId);
    const selectedFilesList = document.getElementById(listId);

    if (!fileInput || !uploadButton || !uploadStatus || !selectedFilesList) {
        console.error("Upload controls not found:", inputId);
        return;
    }

    fileInput.addEventListener("change", () => {
        const newFiles = Array.from(fileInput.files);

        newFiles.forEach(file => {
            const exists = selectedFiles.some(existing =>
                existing.name === file.name &&
                existing.size === file.size &&
                existing.lastModified === file.lastModified
            );

            if (!exists) selectedFiles.push(file);
        });

        renderSelectedFiles(uploadStatus, selectedFilesList);
        fileInput.value = "";
    });

    uploadButton.addEventListener("click", async () => {
        if (!selectedFiles.length) {
            uploadStatus.textContent = "Please select CSV files first.";
            return;
        }

        uploadButton.disabled = true;

        let successful = 0;
        let failed = 0;

        for (const file of [...selectedFiles]) {
            try {
                if (!file.name.toLowerCase().endsWith(".csv")) {
                    throw new Error("Only CSV files are supported.");
                }

                const fileText = await file.text();
                const rawRecords = parseCSV(fileText);
                const type = detectFileType(rawRecords[0]);

                const normalised = rawRecords.map(record =>
                    type === "CDR"
                        ? normaliseCDR(record, file.name)
                        : normaliseIPDR(record, file.name)
                );

                if (type === "CDR") {
                    cdrRecords.push(...normalised);
                } else {
                    ipdrRecords.push(...normalised);
                }

                importHistory.push({
                    name: file.name,
                    type,
                    count: normalised.length,
                    status: "Imported"
                });

                addAudit(`Imported ${file.name} (${type}, ${normalised.length} records).`);
                successful++;
            }

            catch (error) {
                console.error(file.name, error);

                importHistory.push({
                    name: file.name,
                    type: "Unknown",
                    count: 0,
                    status: "Rejected: " + error.message
                });

                addAudit(`Import failed for ${file.name}: ${error.message}`);
                failed++;
            }
        }

        selectedFiles = [];

        renderSelectedFiles(uploadStatus, selectedFilesList);

        uploadStatus.textContent =
            `${successful} file(s) imported successfully. ${failed} file(s) rejected.`;

        uploadButton.disabled = false;

        updateDashboard();
        updateModuleImportTable();
        renderImportedFiles();
        console.log(
    "Import table element:",
    document.getElementById("module-import-table")
);

console.log(
    "Import history contents:",
    JSON.stringify(importHistory, null, 2)
);
        updateCommunicationAnalysis();
        updateCommonContacts();
        updateTimeline();
        updateAuditPage();

        console.log("CDR records:", cdrRecords);
        console.log("IPDR records:", ipdrRecords);
    });
}

function renderSelectedFiles(statusElement, listElement) {
    listElement.innerHTML = "";

    selectedFiles.forEach((file, index) => {
        const li = document.createElement("li");
        li.textContent = file.name + " ";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            selectedFiles.splice(index, 1);
            renderSelectedFiles(statusElement, listElement);
        });

        li.appendChild(removeButton);
        listElement.appendChild(li);
    });

    statusElement.textContent =
        `${selectedFiles.length} file(s) selected.`;
}

/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {
    const subscribers = new Set();

    cdrRecords.forEach(record => {
        subscribers.add(record.caller);
        subscribers.add(record.receiver);
    });

    ipdrRecords.forEach(record => {
        subscribers.add(record.subscriber);
    });

    document.getElementById("total-records").textContent =
        cdrRecords.length + ipdrRecords.length;

    document.getElementById("total-subscribers").textContent =
        subscribers.size;

    document.getElementById("total-calls").textContent =
        cdrRecords.length;

    document.getElementById("total-sessions").textContent =
        ipdrRecords.length;


    updateImportTable();
updateCharts();
renderImportedFiles();
}

/* =========================================
   IMPORT TABLES
========================================= */

function fillImportTable(table) {
    table.innerHTML = "";

    if (!importHistory.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No data imported yet";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    importHistory.forEach(item => {
        const row = document.createElement("tr");

        [item.name, item.type, item.count, item.status].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}


function updateImportTable() {
    // Update Dashboard import table
    const dashboardTable = document.getElementById("import-table");

    if (dashboardTable) {
        fillImportTable(dashboardTable);
    }

    // Update Data Import page table
    const importPageTable = document.getElementById("module-import-table");

    if (importPageTable) {
        fillImportTable(importPageTable);
    }
}


function updateModuleImportTable() {
    const table = document.getElementById("module-import-table");

    if (table) {
        fillImportTable(table);
    }
}


/* =========================================
   DASHBOARD CHARTS
========================================= */

function updateCharts() {
    if (!window.Chart) return;

    const activityCanvas = document.getElementById("communicationChart");
    const recordCanvas = document.getElementById("callChart");

    if (activityCanvas) {
        const dailyActivity = {};

        cdrRecords.forEach(record => {
            const date = record.timestamp.substring(0, 10);

            dailyActivity[date] = (dailyActivity[date] || 0) + 1;
        });

        if (activityChart) activityChart.destroy();

        const dates = Object.keys(dailyActivity).sort();

        activityChart = new Chart(activityCanvas, {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    label: "CDR Records",
                    data: dates.map(date => dailyActivity[date]),
                    borderColor: "#FF4FD8",
                    backgroundColor: "rgba(255,79,216,0.12)",
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    if (recordCanvas) {
        if (recordChart) recordChart.destroy();

        recordChart = new Chart(recordCanvas, {
            type: "doughnut",
            data: {
                labels: ["CDR Records", "IPDR Sessions"],
                datasets: [{
                    data: [cdrRecords.length, ipdrRecords.length],
                    backgroundColor: ["#A855F7", "#EC4899"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

/* =========================================
   COMMUNICATION ANALYSIS
========================================= */

function updateCommunicationAnalysis() {
    const totalCallsElement =
        document.getElementById("communication-total-calls");

    const uniqueNumbersElement =
        document.getElementById("unique-numbers");

    const frequentContactsElement =
        document.getElementById("frequent-contacts");

    const table = document.getElementById("communication-table");

    if (totalCallsElement) {
        totalCallsElement.textContent = cdrRecords.length;
    }

    const numbers = new Set();
    const contacts = {};
    const dailyActivity = {};

    cdrRecords.forEach(record => {
        numbers.add(record.caller);
        numbers.add(record.receiver);

        contacts[record.receiver] =
            (contacts[record.receiver] || 0) + 1;

        const date = record.timestamp.substring(0, 10);
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    if (uniqueNumbersElement) {
        uniqueNumbersElement.textContent = numbers.size;
    }

    if (frequentContactsElement) {
        frequentContactsElement.textContent = Object.keys(contacts).length;
    }

    if (table) {
        table.innerHTML = "";

        cdrRecords.forEach(record => {
            const row = document.createElement("tr");

            [
                record.caller,
                record.receiver,
                record.timestamp,
                record.duration + " sec",
                record.tower || "Not available"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            table.appendChild(row);
        });
    }

    const canvas = document.getElementById("communicationNetworkChart");

    if (!canvas || !window.Chart) return;

    if (communicationAnalysisChart) {
        communicationAnalysisChart.destroy();
    }

    const dates = Object.keys(dailyActivity).sort();

    communicationAnalysisChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Number of Calls",
                data: dates.map(date => dailyActivity[date]),
                borderColor: "#FF4FD8",
                backgroundColor: "rgba(255,79,216,0.15)",
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/* =========================================
   COMMON CONTACTS
========================================= */

function updateCommonContacts() {
    const container = document.getElementById("common-contacts-table");
    const message = document.getElementById("contacts-message");

    if (!container || !message) return;

    const contactMap = {};

    cdrRecords.forEach(record => {
        if (!contactMap[record.receiver]) {
            contactMap[record.receiver] = new Set();
        }

        contactMap[record.receiver].add(record.caller);
    });

    const sharedContacts = Object.entries(contactMap)
        .filter(([, callers]) => callers.size > 1)
        .sort((a, b) => b[1].size - a[1].size);

    container.innerHTML = "";

    if (!sharedContacts.length) {
        message.textContent =
            "No shared contacts found in the imported CDR records.";
        return;
    }

    message.textContent =
        `${sharedContacts.length} shared contact(s) found.`;

    const table = document.createElement("table");
    table.className = "data-table";

    table.innerHTML = `
        <thead>
            <tr>
                <th>Common Contact</th>
                <th>Connected Subscribers</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    sharedContacts.forEach(([number, callers]) => {
        const row = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = number;

        const countCell = document.createElement("td");
        countCell.textContent = callers.size;

        row.append(numberCell, countCell);
        tbody.appendChild(row);
    });

    container.appendChild(table);
}

/* =========================================
   TOWER TIMELINE
========================================= */

function updateTimeline() {
    const table = document.getElementById("timeline-table");
    const message = document.getElementById("timeline-message");

    if (!table || !message) return;

    table.innerHTML = "";

    const records = cdrRecords
        .filter(record => record.tower)
        .sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

    if (!records.length) {
        message.textContent =
            "No tower information found. Import CDR records containing a tower ID.";
        return;
    }

    message.textContent = `${records.length} tower activity record(s) found.`;

    records.forEach(record => {
        const row = document.createElement("tr");

        [
            record.caller,
            record.timestamp,
            record.tower,
            record.receiver
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

/* =========================================
   INVESTIGATION ASSISTANT
========================================= */

document.addEventListener("click", event => {
    const button = event.target.closest("#ask-assistant");

    if (!button) return;

    const input = document.getElementById("assistant-question");
    const output = document.getElementById("assistant-response");

    if (!input || !output) return;

    const question = input.value.trim().toLowerCase();

    if (!question) {
        output.textContent = "Please enter a question.";
        return;
    }

    if (!cdrRecords.length && !ipdrRecords.length) {
        output.textContent = "Please import sample records first.";
        return;
    }

    const subscribers = new Set();

    cdrRecords.forEach(record => {
        subscribers.add(record.caller);
        subscribers.add(record.receiver);
    });

    ipdrRecords.forEach(record => {
        subscribers.add(record.subscriber);
    });

    let answer;

    if (question.includes("total") || question.includes("record")) {
        answer = `Total Records: ${cdrRecords.length + ipdrRecords.length}
CDR Records: ${cdrRecords.length}
IPDR Sessions: ${ipdrRecords.length}`;
    }

    else if (question.includes("subscriber")) {
        answer = `Unique Subscribers / Numbers: ${subscribers.size}`;
    }

    else if (
        question.includes("call") ||
        question.includes("communication")
    ) {
        answer = `Total Communication Records: ${cdrRecords.length}`;
    }

    else if (
        question.includes("ipdr") ||
        question.includes("session")
    ) {
        answer = `Total IPDR Sessions: ${ipdrRecords.length}`;
    }

    else if (
        question.includes("contact") ||
        question.includes("frequent")
    ) {
        const counts = {};

        cdrRecords.forEach(record => {
            counts[record.receiver] =
                (counts[record.receiver] || 0) + 1;
        });

        answer = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([number, count]) => `${number}: ${count} calls`)
            .join("\n") || "No contacts found.";
    }

    else {
        answer =
            "Try asking about total records, subscribers, calls, IPDR sessions or frequent contacts.";
    }

    output.textContent = answer;
    addAudit("Assistant question submitted.");
});

/* =========================================
   REPORT GENERATION
========================================= */

document.addEventListener("click", event => {
    if (event.target.id !== "generate-report") return;

    const output = document.getElementById("report-output");
    if (!output) return;

    const totalRecords = cdrRecords.length + ipdrRecords.length;

    const report = `
SIGNALTRACE - INVESTIGATION REPORT
==================================

Generated: ${new Date().toLocaleString()}

Total Records: ${totalRecords}
CDR Records: ${cdrRecords.length}
IPDR Sessions: ${ipdrRecords.length}

IMPORTED FILES
==================================

${importHistory.map((item, index) => `
${index + 1}. ${item.name}
Type: ${item.type}
Records: ${item.count}
Status: ${item.status}
`).join("\n")}

==================================
END OF REPORT
`;

    output.innerHTML = `
        <h3>Report Generated Successfully</h3>
        <p>Total Records: ${totalRecords}</p>
        <p>CDR Records: ${cdrRecords.length}</p>
        <p>IPDR Sessions: ${ipdrRecords.length}</p>
        <button id="download-report" type="button">
            Download Report
        </button>
    `;

    const downloadButton = document.getElementById("download-report");

    downloadButton.addEventListener("click", () => {
        const blob = new Blob([report], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "SignalTrace_Investigation_Report.txt";
        link.click();

        URL.revokeObjectURL(url);
    });

    addAudit("Investigation report generated.");
});

/* =========================================
   AUDIT LOGS
========================================= */

function updateAuditPage() {
    const table = document.getElementById("audit-table");
    if (!table) return;

    table.innerHTML = "";

    if (!auditLogs.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 2;
        cell.textContent = "No activity recorded yet.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    auditLogs.forEach(log => {
        const row = document.createElement("tr");

        const timeCell = document.createElement("td");
        timeCell.textContent = log.time;

        const messageCell = document.createElement("td");
        messageCell.textContent = log.message;

        row.append(timeCell, messageCell);
        table.appendChild(row);
    });
}

/* =========================================
   INITIALISE APPLICATION
========================================= */

// Dashboard upload controls
bindUploadControls(
    "csv-files",
    "upload-button",
    "upload-status",
    "selected-files"
);

// Initial dashboard values and charts
updateDashboard();

addAudit("SignalTrace application started.");

console.log("SignalTrace data engine ready.");