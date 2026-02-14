import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Invoice from "./Invoice";

const API = import.meta.env.VITE_API_BASE_URL;

export default function ProformaRender() {
  const { token } = useParams();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/invoice/render/${token}`)
      .then((r) => r.json())
      .then(setDraft);
  }, [token]);

  if (!draft) return null; // puppeteer waits

  return (
    <div style={{ padding: 24 }}>
      <Invoice previewData={draft} />
    </div>
  );
}
