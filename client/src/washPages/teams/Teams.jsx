import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Lock,
  UserPlus,
  Search,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import api from "./utils/axiosInstance";

export default function Teams() {
  /* ================= STATES ================= */
  const [adminEmail, setAdminEmail] = useState("");
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);

  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchTeamInfo();
    fetchStaff();
  }, []);

  const fetchTeamInfo = async () => {
    const res = await api.get("/api/teams/info");
    setAdminEmail(res.data.admin.email);
    setUsed(res.data.team.used);
    setLimit(res.data.team.limit);
  };

  const fetchStaff = async () => {
    const res = await api.get("/api/washing-staff");
    setStaffList(res.data || []);
  };

  /* ================= STAFF CLICK ================= */
  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setUsername(staff.name || "");
    setEmail(staff.email || "");

    if (staff.hasAccount) {
      setAlreadyRegistered(true);
      setError("This employee already has a team account");
    } else {
      setAlreadyRegistered(false);
      setError("");
    }
  };

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (alreadyRegistered) return;

    try {
      setLoading(true);
      setError("");

      await api.post("/api/teams/create", {
        username,
        email,
        password,
      });

      setSuccessModal(true);
      setPassword("");
      setAlreadyRegistered(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create team account"
      );
    } finally {
      setLoading(false);
    }
  };

  const available = limit - used;

  const filteredStaff = staffList.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6">
      {/* SUCCESS MODAL */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-8 text-center w-[320px] shadow-xl">
            <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold">Registered Successfully</h3>
            <p className="text-sm text-gray-500 mt-1">
              Team account created successfully
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-center mb-2">
        Create Team Account
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Select staff members and create team accounts for your garage
      </p>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
        <SummaryCard icon={<ShieldCheck />} label="Admin" value={adminEmail} />
        <SummaryCard
          icon={<UserCheck />}
          label="Used Slots"
          value={`${used}/${limit}`}
        />
        <SummaryCard
          icon={<TrendingUp />}
          label="Available"
          value={available}
          green
        />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* STAFF LIST */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-blue-600" />
            <h3 className="font-semibold text-lg">Staff Members</h3>
          </div>

          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl"
            />
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {filteredStaff.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                <Users className="mx-auto mb-2" size={40} />
                No staff found
              </div>
            )}

            {filteredStaff.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectStaff(s)}
                className={`p-3 rounded-xl cursor-pointer border transition ${
                  s.hasAccount
                    ? "bg-gray-100 cursor-not-allowed"
                    : selectedStaff?.id === s.id
                    ? "bg-blue-50 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">{s.email}</p>
                {s.hasAccount && (
                  <span className="text-xs text-red-600">
                    Already registered
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="p-4 bg-blue-600 rounded-2xl text-white mb-3">
              <UserPlus size={28} />
            </div>
            <h2 className="text-2xl font-bold">Create Team Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details below to create a new team member
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-5">
            <Input
              label="Username"
              icon={<Users size={18} />}
              value={username}
              onChange={setUsername}
              disabled={!!selectedStaff}
              placeholder="e.g., john_doe"
            />

            <Input
              label="Email Address"
              icon={<Mail size={18} />}
              value={email}
              onChange={setEmail}
              disabled={!!selectedStaff}
            />

            <Input
              label="Password"
              icon={<Lock size={18} />}
              type="password"
              value={password}
              onChange={setPassword}
              disabled={alreadyRegistered}
            />

            <button
              onClick={handleCreate}
              disabled={
                alreadyRegistered ||
                loading ||
                available <= 0 ||
                !email ||
                !password
              }
              className={`w-full py-3 rounded-xl font-semibold transition ${
                alreadyRegistered || available <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Create Team Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const SummaryCard = ({ icon, label, value, green }) => (
  <div
    className={`p-4 rounded-xl border flex items-center gap-4 ${
      green ? "border-green-400 bg-green-50" : "bg-white"
    }`}
  >
    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

const Input = ({
  label,
  icon,
  value,
  onChange,
  type = "text",
  disabled,
}) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  </div>
);
