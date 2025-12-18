import { useState } from "react";
import axios from "../utils/axiosInstance";

export default function TeamLogin() {
  const [adminEmail, setAdminEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchAdmin = async () => {
    const res = await axios.post("/api/team/validate-admin", {
      adminEmail
    });
    if (!res.data.allowed) {
      alert("Team login not allowed for this admin");
    }
  };

  return (
    <div>
      <h2>Team Login</h2>

      <input
        placeholder="Admin Email"
        value={adminEmail}
        onBlur={fetchAdmin}
        onChange={e => setAdminEmail(e.target.value)}
      />

      <input
        placeholder="Your Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button>Login</button>
    </div>
  );
}
