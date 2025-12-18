import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useParams } from "react-router-dom";

export default function TeamRegister() {
  const { companyId } = useParams();
  const [adminEmail, setAdminEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    axios.get(`/api/company/${companyId}`)
      .then(res => {
        if (res.data.planType === "BASIC") {
          alert("Team accounts not allowed for this plan");
          return;
        }
        setAdminEmail(res.data.adminEmail);
      });
  }, []);

  const handleRegister = async () => {
    await axios.post("/api/team/register", {
      companyId,
      email,
      password
    });
    alert("Team account created");
  };

  return (
    <div>
      <h2>Team Registration</h2>

      <input value={adminEmail} disabled />
      <input
        placeholder="Team Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Create Account</button>
    </div>
  );
}
