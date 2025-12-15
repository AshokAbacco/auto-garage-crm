// src/washPages/services/SMSalert.jsx
import React, { useMemo, useRef, useState } from "react";

/**
 * SMSalert.jsx
 * Dashboard-style colorful SMS Alerts demo (frontend-only).
 */

const DUMMY_CLIENTS = [
    { id: "C-101", name: "Ravi Sharma", phone: "+919876543210" },
    { id: "C-102", name: "Neha Patel", phone: "+919812345678" },
    { id: "C-103", name: "Amit Mehra", phone: "+919700111222" },
    { id: "C-104", name: "Sita Rao", phone: "+919999888777" },
];

const GSM_160 = 160;
const GSM_CONCAT_153 = 153;
const UCS2_70 = 70;
const UCS2_CONCAT_67 = 67;

function isUnicode(text) {
    return /[^\u0000-\u007F]/.test(text);
}
function estimateSegments(text) {
    if (!text) return { chars: 0, segments: 0 };
    const unicode = isUnicode(text);
    const chars = text.length;
    if (!unicode) {
        if (chars <= GSM_160) return { chars, segments: 1 };
        return { chars, segments: Math.ceil(chars / GSM_CONCAT_153) };
    } else {
        if (chars <= UCS2_70) return { chars, segments: 1 };
        return { chars, segments: Math.ceil(chars / UCS2_CONCAT_67) };
    }
}

export default function SMSalert() {
    // State: templates, compose, recipients, jobs
    const [templates, setTemplates] = useState([
        { id: "T1", name: "Welcome", body: "Hi {{name}}, welcome! Your booking: {{date}}." },
        { id: "T2", name: "Ready", body: "Hello {{name}}, your vehicle is ready for pickup. ₹{{amount}}." },
    ]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [message, setMessage] = useState("");
    const [recipientInput, setRecipientInput] = useState("");
    const [recipients, setRecipients] = useState([]); // {phone,name,optedOut}
    const [selectedClients, setSelectedClients] = useState([]);
    const [scheduleAt, setScheduleAt] = useState("");
    const [jobs, setJobs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const fileRef = useRef(null);

    const estimate = useMemo(() => estimateSegments(message), [message]);
    const totalRecipients = recipients.length + selectedClients.length + (recipientInput ? 1 : 0);

    const palette = {
        teal: "from-teal-400 to-cyan-500",
        purple: "from-violet-600 to-violet-400",
        orange: "from-orange-400 to-orange-500",
        pink: "from-pink-400 to-rose-500",
        green: "from-emerald-400 to-green-500",
        blue: "from-blue-500 to-indigo-500",
    };

    // Simple phone normalizer (demo)
    function normalizePhone(p) {
        if (!p) return "";
        let t = String(p).trim();
        if (/^\d{10}$/.test(t)) t = "+91" + t;
        if (/^0\d{10}$/.test(t)) t = "+91" + t.slice(1);
        return t;
    }

    // recipients handlers
    function addManualRecipient() {
        const p = normalizePhone(recipientInput);
        if (!p) return alert("Enter phone (10 digits or E.164).");
        setRecipients((r) =>
            r.some((x) => x.phone === p) ? r : [...r, { phone: p, name: null, optedOut: false }]
        );
        setRecipientInput("");
    }
    function removeRecipient(p) {
        setRecipients((r) => r.filter((x) => x.phone !== p));
    }
    function toggleOptOut(p) {
        setRecipients((r) =>
            r.map((x) => (x.phone === p ? { ...x, optedOut: !x.optedOut } : x))
        );
    }
    function toggleClient(client) {
        setSelectedClients((s) =>
            s.some((c) => c.id === client.id)
                ? s.filter((c) => c.id !== client.id)
                : [...s, client]
        );
    }

    // CSV import (naive)
    function importCsv(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const rows = e.target.result
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
            const parsed = rows
                .map((r) => {
                    const parts = r.split(",");
                    const phone = normalizePhone(
                        parts.length === 1 ? parts[0] : parts[1] || ""
                    );
                    const name = parts.length > 1 ? parts[0].trim() : null;
                    return phone ? { phone, name, optedOut: false } : null;
                })
                .filter(Boolean);
            setRecipients((cur) => {
                const merged = [...cur];
                parsed.forEach((p) => {
                    if (!merged.some((m) => m.phone === p.phone)) merged.push(p);
                });
                return merged;
            });
        };
        reader.readAsText(file);
    }
    function onCsv(e) {
        const f = e.target.files?.[0];
        if (f) importCsv(f);
        e.target.value = "";
    }

    // template CRUD (in-memory)
    function createTemplate() {
        const name = prompt("Template name:");
        if (!name) return;
        const body = prompt("Template body (use {{name}} etc):", "Hi {{name}}, ...");
        if (body == null) return;
        const id = "T" + Math.random().toString(36).slice(2, 6).toUpperCase();
        setTemplates((t) => [{ id, name, body }, ...t]);
    }
    function editTemplate(id) {
        const tpl = templates.find((t) => t.id === id);
        if (!tpl) return;
        const name = prompt("Edit name:", tpl.name);
        if (name == null) return;
        const body = prompt("Edit body:", tpl.body);
        if (body == null) return;
        setTemplates((t) =>
            t.map((x) => (x.id === id ? { ...x, name, body } : x))
        );
    }
    function deleteTemplate(id) {
        if (!confirm("Delete template?")) return;
        setTemplates((t) => t.filter((x) => x.id !== id));
    }

    // Apply template
    function applyTemplate(id) {
        const t = templates.find((x) => x.id === id);
        if (!t) return;
        setSelectedTemplate(id);
        setMessage(t.body);
    }

    // Send simulation: create job and fake statuses
    function sendSMS({ test = false } = {}) {
        const manual = recipientInput ? [normalizePhone(recipientInput)] : [];
        const explicit = recipients.map((r) => r);
        const selected = selectedClients.map((c) => ({ phone: c.phone }));
        const final = [
            ...manual.map((p) => ({ phone: p })),
            ...selected,
            ...explicit,
        ].filter(Boolean);
        if (!final.length) return alert("Add recipients.");
        if (!message.trim()) return alert("Message empty.");

        const id =
            "JOB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        const job = {
            id,
            createdAt: new Date().toISOString(),
            status: "queued",
            total: final.length,
            details: final.map((f) => ({ phone: f.phone, status: "queued" })),
        };
        setJobs((j) => [job, ...j]);
        setRecipientInput("");

        // simulate progress
        setTimeout(
            () =>
                setJobs((cur) =>
                    cur.map((j2) =>
                        j2.id === id ? { ...j2, status: "sending" } : j2
                    )
                ),
            600
        );
        setTimeout(() => {
            setJobs((cur) =>
                cur.map((j2) => {
                    if (j2.id !== id) return j2;
                    const details = j2.details.map((d) => ({
                        ...d,
                        status: Math.random() < 0.05 ? "failed" : "sent",
                    }));
                    return {
                        ...j2,
                        status: "completed",
                        details,
                        completedAt: new Date().toISOString(),
                    };
                })
            );
        }, 1700);

        if (test) alert("Test SMS simulated to first recipient.");
    }

    // Small metrics
    const totalRevenue = 0;
    const paidRevenue = 0;
    const pendingRevenue = 0;
    const totalServices = jobs.reduce((acc, j) => acc + (j.total || 0), 0);
    const completedCount = jobs.reduce(
        (acc, j) => acc + (j.status === "completed" ? 1 : 0),
        0
    );
    const pendingCount = jobs.reduce(
        (acc, j) => acc + (j.status !== "completed" ? 1 : 0),
        0
    );
    const avgServiceCost = 0; // not used, kept for future

    // Filter jobs for logs
    const visibleJobs = jobs.filter((j) =>
        filterStatus === "all" ? true : j.status === filterStatus
    );

    return (
        <div className="min-h-screen p-6 bg-[#f0fbff] text-slate-800">
            {/* Gradient header bar (same style as other pages) */}
            <div className="mb-6">
                <div className="overflow-hidden shadow-md rounded-xl">
                    <div className="flex items-center justify-between px-8 py-10 bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] rounded-xl">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white md:text-4xl">
                                Washing SMS Alerts
                            </h1>
                            <p className="mt-2 text-white/90">
                                Send alerts, manage templates and review send logs.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setJobs([]);
                                    alert("Cleared jobs (demo)");
                                }}
                                className="px-3 py-2 text-sm text-white border rounded-lg shadow-sm bg-white/10 border-white/40 hover:bg-white/20"
                            >
                                Clear Logs
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 text-sm font-medium bg-white rounded-lg shadow-md text-sky-600 hover:bg-slate-50"
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric cards (colorful gradients) */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-6">
                <div
                    className={`rounded-xl p-5 text-white shadow-md bg-gradient-to-r ${palette.teal}`}
                >
                    <div className="text-xs opacity-90">Total Revenue</div>
                    <div className="mt-3 text-2xl font-bold">
                        ₹ {totalRevenue.toLocaleString()}
                    </div>
                </div>

                <div
                    className={`rounded-xl p-5 text-white shadow-md bg-gradient-to-r ${palette.purple}`}
                >
                    <div className="text-xs opacity-90">Paid Revenue</div>
                    <div className="mt-3 text-2xl font-bold">
                        ₹ {paidRevenue.toLocaleString()}
                    </div>
                </div>

                <div
                    className={`rounded-xl p-5 text-white shadow-md bg-gradient-to-r ${palette.orange}`}
                >
                    <div className="text-xs opacity-90">Pending Revenue</div>
                    <div className="mt-3 text-2xl font-bold">
                        ₹ {pendingRevenue.toLocaleString()}
                    </div>
                </div>

                <div
                    className={`rounded-xl p-5 text-white shadow-md bg-gradient-to-r ${palette.green}`}
                >
                    <div className="text-xs opacity-90">Total Messages Sent</div>
                    <div className="mt-3 text-2xl font-bold">{totalServices}</div>
                </div>

                <div
                    className={`rounded-xl p-5 text-white shadow-md bg-gradient-to-r ${palette.blue}`}
                >
                    <div className="text-xs opacity-90">Completed Jobs</div>
                    <div className="mt-3 text-2xl font-bold">{completedCount}</div>
                </div>

                <div
                    className={`rounded-xl p-5 text-white shadow-md bg-gradient-to-r ${palette.pink}`}
                >
                    <div className="text-xs opacity-90">Pending Jobs</div>
                    <div className="mt-3 text-2xl font-bold">{pendingCount}</div>
                </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Compose area */}
                <section className="p-6 bg-white shadow-sm lg:col-span-2 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            Compose SMS
                        </h2>
                        <div className="text-sm text-slate-500">
                            Recipients:{" "}
                            <span className="font-medium text-slate-800">
                                {totalRecipients}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <label className="text-sm text-slate-600">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 mt-2 border rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="Type message... use {{name}}, {{date}} placeholders"
                            />
                            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                <div>
                                    Preview:{" "}
                                    <span className="font-medium text-slate-700">
                                        {message
                                            ? message.slice(0, 80) +
                                            (message.length > 80 ? "…" : "")
                                            : "—"}
                                    </span>
                                </div>
                                <div>
                                    {isUnicode(message) ? "Unicode" : "GSM"} • Segments:{" "}
                                    <strong>{estimate.segments}</strong>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-600">Template</label>
                            <div className="flex flex-col gap-2 mt-2">
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) =>
                                        applyTemplateFromSelect(e.target.value)
                                    }
                                    className="px-3 py-2 border rounded-lg text-slate-700"
                                >
                                    <option value="">— Select template —</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => createTemplate()}
                                        className="flex-1 px-3 py-2 bg-white border rounded-lg"
                                    >
                                        + New
                                    </button>
                                    <button
                                        onClick={() =>
                                            selectedTemplate
                                                ? editTemplate(selectedTemplate)
                                                : alert("Pick a template")
                                        }
                                        className="px-3 py-2 bg-white border rounded-lg"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipients area */}
                    <div className="pt-5 mt-5 border-t">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-sm text-slate-600">Recipients</div>
                                <div className="text-xs text-slate-400">
                                    Add manual, choose clients or import CSV
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={onCsv}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="px-3 py-2 bg-white border rounded-lg"
                                >
                                    Import CSV
                                </button>
                                <button
                                    onClick={() => exportRecipients()}
                                    className="px-3 py-2 bg-white border rounded-lg"
                                >
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <label className="text-xs text-slate-500">
                                    Manual number
                                </label>
                                <div className="flex gap-2 mt-2">
                                    <input
                                        value={recipientInput}
                                        onChange={(e) =>
                                            setRecipientInput(e.target.value)
                                        }
                                        placeholder="+919XXXXXXXXX"
                                        className="flex-1 px-3 py-2 border rounded-lg text-slate-700"
                                    />
                                    <button
                                        onClick={() => addManualRecipient()}
                                        className="px-4 py-2 text-white bg-indigo-600 rounded-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">
                                    Schedule
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduleAt}
                                    onChange={(e) => setScheduleAt(e.target.value)}
                                    className="w-full px-3 py-2 mt-2 border rounded-lg text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                            <div>
                                <div className="mb-2 text-sm text-slate-700">
                                    Select Clients
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {DUMMY_CLIENTS.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => toggleClient(c)}
                                            className={`px-3 py-1 rounded-md text-sm ${selectedClients.some(
                                                (s) => s.id === c.id
                                            )
                                                ? "bg-indigo-600 text-white"
                                                : "bg-white border"
                                                }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 text-sm text-slate-700">
                                    Imported / Manual
                                </div>
                                <div className="space-y-2">
                                    {recipients.length === 0 ? (
                                        <div className="text-xs text-slate-400">
                                            No recipients
                                        </div>
                                    ) : (
                                        recipients.map((r) => (
                                            <div
                                                key={r.phone}
                                                className="flex items-center justify-between px-3 py-2 bg-white border rounded-md"
                                            >
                                                <div>
                                                    <div className="font-medium text-slate-800">
                                                        {r.name || "—"}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {r.phone}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            toggleOptOut(r.phone)
                                                        }
                                                        className={`text-xs px-2 py-1 rounded ${r.optedOut
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-green-50 text-green-800 border"
                                                            }`}
                                                    >
                                                        {r.optedOut
                                                            ? "Opt-out"
                                                            : "Active"}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            removeRecipient(r.phone)
                                                        }
                                                        className="px-2 py-1 text-xs border rounded"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-5">
                            <div className="text-sm text-slate-600">
                                Total recipients:{" "}
                                <strong className="text-slate-800">
                                    {totalRecipients}
                                </strong>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => sendSMS({ test: true })}
                                    className="px-4 py-2 bg-white border rounded-lg"
                                >
                                    Send Test
                                </button>
                                <button
                                    onClick={() => sendSMS()}
                                    className="px-4 py-2 font-semibold text-white rounded-lg bg-emerald-500"
                                >
                                    Send{scheduleAt ? " / Schedule" : ""}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right column: templates + logs */}
                <aside className="space-y-4">
                    <div className="p-4 bg-white shadow-sm rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Templates
                            </h3>
                            <button
                                onClick={() => createTemplate()}
                                className="px-3 py-1 text-sm bg-white border rounded-lg"
                            >
                                + New
                            </button>
                        </div>
                        <div className="space-y-3">
                            {templates.map((t) => (
                                <div
                                    key={t.id}
                                    className="p-3 border rounded-md bg-gradient-to-r from-white to-white"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-slate-800">
                                                {t.name}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {t.body.slice(0, 80)}
                                                {t.body.length > 80 ? "..." : ""}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() =>
                                                    applyTemplateFromSelect(t.id)
                                                }
                                                className="px-2 py-1 text-xs text-white bg-indigo-600 rounded"
                                            >
                                                Apply
                                            </button>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() =>
                                                        editTemplate(t.id)
                                                    }
                                                    className="px-2 py-1 text-xs border rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteTemplate(t.id)
                                                    }
                                                    className="px-2 py-1 text-xs text-red-600 border rounded"
                                                >
                                                    Del
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-white shadow-sm rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Jobs & Logs
                            </h3>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="px-2 py-1 text-sm border rounded-lg"
                                >
                                    <option value="all">All</option>
                                    <option value="queued">Queued</option>
                                    <option value="sending">Sending</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 overflow-auto max-h-72">
                            {visibleJobs.length === 0 ? (
                                <div className="text-xs text-slate-400">
                                    No jobs yet
                                </div>
                            ) : (
                                visibleJobs.map((j) => (
                                    <div
                                        key={j.id}
                                        className="p-3 border rounded-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium text-slate-800">
                                                    {j.id}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {j.total} recipients •{" "}
                                                    {new Date(
                                                        j.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div
                                                className={`text-sm px-2 py-1 rounded ${j.status === "completed"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {j.status}
                                            </div>
                                        </div>

                                        <details className="mt-2 text-xs text-slate-600">
                                            <summary className="cursor-pointer">
                                                View recipients (
                                                {j.details.length})
                                            </summary>
                                            <div className="mt-2 space-y-1">
                                                {j.details.map((d) => (
                                                    <div
                                                        key={d.phone}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="text-xs text-slate-700">
                                                            {d.phone}
                                                        </div>
                                                        <div
                                                            className={`text-xs px-2 py-0.5 rounded ${d.status ===
                                                                "sent"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : d.status ===
                                                                    "failed"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                                }`}
                                                        >
                                                            {d.status}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );

    // helper closures defined after return
    function exportRecipients() {
        const lines = [
            "name,phone",
            ...recipients.map((r) => `${r.name || ""},${r.phone}`),
            ...selectedClients.map((c) => `${c.name},${c.phone}`),
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recipients.csv";
        a.click();
        URL.revokeObjectURL(url);
    }
    function applyTemplateFromSelect(id) {
        applyTemplate(id);
    }
}
