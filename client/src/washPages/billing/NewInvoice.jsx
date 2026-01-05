import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    User,
    Wrench,
    IndianRupee,
    CreditCard,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext"; // Import theme context

const API = import.meta.env.VITE_API_BASE_URL;



export default function NewInvoice() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { state } = useLocation();   // ✅ hook inside component
    const token = localStorage.getItem("token");

    const preselectedServiceId = state?.serviceId || ""; // ✅ safe here


    const isEdit = state?.isEdit;
    const billing = state?.billing;

    /* ================= EDITABLE STATE ================= */
    const [invoiceNumber, setInvoiceNumber] = useState(
        billing?.invoiceNumber || `INV-${Date.now()}`
    );

    const [invoiceDate, setInvoiceDate] = useState(
        billing?.invoiceDate?.split("T")[0] ||
        new Date().toISOString().split("T")[0]
    );

    const [client, setClient] = useState({
        id: billing?.washingClient?.id || "",
        fullName: billing?.washingClient?.fullName || "",
        phone: billing?.washingClient?.phone || "",
        email: billing?.washingClient?.email || "",
        address: billing?.washingClient?.address || "",
        regNumber: billing?.washingClient?.regNumber || "",
    });


    const [service, setService] = useState({
        category: billing?.category?.name || "",
        subService: billing?.subService?.name || "",
        date: billing?.serviceDate?.split("T")[0] || "",
        notes: billing?.notes || "",
    });

    const [cost, setCost] = useState(Number(billing?.partsCost || 0));
    const [gstPercent, setGstPercent] = useState(Number(billing?.partsGst || 0));

    const [paymentMode, setPaymentMode] = useState(billing?.paymentMode || "");
    const [status, setStatus] = useState(billing?.status || "PENDING");

    /* ================= CALCULATIONS ================= */
    const gstAmount = (cost * gstPercent) / 100;
    const grandTotal = cost + gstAmount;

    /* ================= SUBMIT ================= */
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId);


    useEffect(() => {
        if (!selectedServiceId) return;

        const selected = services.find(s => s.id == selectedServiceId);
        if (!selected) return;

        setService({
            category: selected.category?.name || "",
            subService: selected.subService?.name || "",
            date: selected.date?.split("T")[0] || "",
            notes: selected.notes || "",
        });

        setCost(Number(selected.partsCost || 0));
        setGstPercent(Number(selected.partsGst || 0));

        setClient({
            id: selected.client?.id || "",
            fullName: selected.client?.fullName || "",
            phone: selected.client?.phone || "",
            email: selected.client?.email || "",
            address: selected.client?.address || "",
            regNumber: selected.client?.regNumber || "",
        });

    }, [selectedServiceId, services]);


    useEffect(() => {
        const fetchServices = async () => {
            const res = await fetch(`${API}/api/washing-services`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
        };
        fetchServices();
    }, []);

    useEffect(() => {
        if (isEdit && billing?.services?.length) {
            setSelectedServiceId(billing.services[0].washingService.id);
        }
    }, [isEdit, billing]);

    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetch(`${API}/api/clients`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setClients(Array.isArray(data) ? data : []));
    }, []);


    const submitInvoice = async () => {
        const url = isEdit
            ? `${API}/api/wash-billing/${billing.id}`
            : `${API}/api/wash-billing`;

        const method = isEdit ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                washingClientId: client.id,
                serviceIds: [selectedServiceId],
                invoiceNumber,
                invoiceDate,
                partsCost: cost,
                partsGst: gstPercent,
                grandTotal,
                paymentMode,
                status,
            }),
        });

        navigate("/washing-Billing");
    };


    return (
        <div className={`min-h-screen p-6 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* HEADER */}
                <button
                    onClick={() => navigate(-1)}
                    className={`flex items-center gap-2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-700"}`}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : ""}`}>Create Invoice</h1>

                {/* INVOICE INFO */}
                <Card title="Invoice Information" icon={<FileText />} isDark={isDark}>
                    <Grid>
                        <Input
                            label="Invoice Number"
                            value={invoiceNumber}
                            onChange={e => setInvoiceNumber(e.target.value)}
                            isDark={isDark}
                        />
                        <Input
                            label="Invoice Date"
                            type="date"
                            value={invoiceDate}
                            onChange={e => setInvoiceDate(e.target.value)}
                            isDark={isDark}
                        />
                    </Grid>
                </Card>

                {/* CLIENT */}
                <Card title="Client Details" icon={<User />} isDark={isDark}>
                    <Grid>
                        <Select
                            label="Select Service"
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            isDark={isDark}
                        >
                            <option value="">Select Service</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.subService?.name} - {s.client?.fullName}
                                </option>
                            ))}
                        </Select>


                        <Input
                            label="Phone"
                            value={client.phone}
                            onChange={e => setClient({ ...client, phone: e.target.value })}
                            isDark={isDark}
                        />
                        <Input
                            label="Email"
                            value={client.email}
                            onChange={e => setClient({ ...client, email: e.target.value })}
                            isDark={isDark}
                        />
                        <Input
                            label="Vehicle Reg No"
                            value={client.regNumber}
                            onChange={e => setClient({ ...client, regNumber: e.target.value })}
                            isDark={isDark}
                        />
                    </Grid>
                    <Textarea
                        label="Address"
                        value={client.address}
                        onChange={e => setClient({ ...client, address: e.target.value })}
                        isDark={isDark}
                    />
                </Card>

                {/* SERVICE */}
                <Card title="Service Details" icon={<Wrench />} isDark={isDark}>
                    <Grid>
                        <Input
                            label="Category"
                            value={service.category}
                            onChange={e => setService({ ...service, category: e.target.value })}
                            isDark={isDark}
                        />
                        <Input
                            label="Sub Service"
                            value={service.subService}
                            onChange={e => setService({ ...service, subService: e.target.value })}
                            isDark={isDark}
                        />
                        <Input
                            label="Service Date"
                            type="date"
                            value={service.date}
                            onChange={e => setService({ ...service, date: e.target.value })}
                            isDark={isDark}
                        />
                    </Grid>
                    <Textarea
                        label="Notes"
                        value={service.notes}
                        onChange={e => setService({ ...service, notes: e.target.value })}
                        isDark={isDark}
                    />
                </Card>

                {/* COST */}
                <Card title="Cost Breakdown" icon={<IndianRupee />} isDark={isDark}>
                    <Grid>
                        <Input
                            label="Service Cost (₹)"
                            type="number"
                            value={cost}
                            onChange={e => setCost(Number(e.target.value))}
                            isDark={isDark}
                        />
                        <Input
                            label="GST %"
                            type="number"
                            value={gstPercent}
                            onChange={e => setGstPercent(Number(e.target.value))}
                            isDark={isDark}
                        />
                        <Input
                            label="GST Amount"
                            value={gstAmount.toFixed(2)}
                            disabled
                            isDark={isDark}
                        />
                        <Input
                            label="Grand Total"
                            value={grandTotal.toFixed(2)}
                            disabled
                            isDark={isDark}
                        />
                    </Grid>
                </Card>

                {/* PAYMENT */}
                <Card title="Payment Details" icon={<CreditCard />} isDark={isDark}>
                    <Grid>
                        <Select
                            label="Payment Mode"
                            value={paymentMode}
                            onChange={e => setPaymentMode(e.target.value)}
                            isDark={isDark}
                        >
                            <option value="">Select</option>
                            <option>Cash</option>
                            <option>UPI</option>
                            <option>Card</option>
                        </Select>

                        <Select
                            label="Status"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            isDark={isDark}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                        </Select>
                    </Grid>
                </Card>

                {/* ACTION */}
                <button
                    onClick={submitInvoice}
                    className={`w-full py-3 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isDark
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                >
                    Create Invoice
                </button>
            </div>
        </div>
    );
}

/* ================= UI HELPERS ================= */

function Card({ title, icon, children, isDark }) {
    return (
        <div className={`p-6 rounded-xl transition-all duration-300 ${isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white shadow"
            }`}>
            <h3 className={`flex items-center gap-2 mb-4 font-semibold ${isDark ? "text-white" : ""
                }`}>
                {icon} {title}
            </h3>
            {children}
        </div>
    );
}

function Grid({ children }) {
    return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Input({ label, isDark, ...props }) {
    return (
        <div>
            <label className={`block mb-1 text-sm ${isDark ? "text-gray-300" : ""}`}>{label}</label>
            <input
                {...props}
                className={`w-full p-3 rounded-lg transition-all duration-300 outline-none ${isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    } border`}
            />
        </div>
    );
}

function Textarea({ label, isDark, ...props }) {
    return (
        <div className="mt-4">
            <label className={`block mb-1 text-sm ${isDark ? "text-gray-300" : ""}`}>{label}</label>
            <textarea
                {...props}
                className={`w-full p-3 rounded-lg transition-all duration-300 outline-none resize-none ${isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    } border`}
                rows={3}
            />
        </div>
    );
}

function Select({ label, children, isDark, ...props }) {
    return (
        <div>
            <label className={`block mb-1 text-sm ${isDark ? "text-gray-300" : ""}`}>{label}</label>
            <select
                {...props}
                className={`w-full p-3 rounded-lg transition-all duration-300 outline-none ${isDark
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    } border`}
            >
                {children}
            </select>
        </div>
    );
}