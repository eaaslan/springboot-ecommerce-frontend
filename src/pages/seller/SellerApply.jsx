import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";

const EMPTY = {
  businessName: "",
  taxId: "",
  iban: "",
  contactEmail: "",
  contactPhone: "",
};

export default function SellerApply() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [existing, setExisting] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // If user already has a seller record, redirect to dashboard.
  useEffect(() => {
    api
      .get("/api/sellers/me")
      .then((r) => setExisting(r.data || r))
      .catch((e) => {
        if (e.status !== 404) setError(e.message);
      })
      .finally(() => setLoadingExisting(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/sellers/apply", {
        businessName: form.businessName.trim(),
        taxId: form.taxId.trim(),
        iban: form.iban.trim(),
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
      });
      navigate("/seller/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingExisting) return <div className="container">Loading…</div>;
  if (existing) {
    return (
      <div className="container">
        <h1>You already have a seller account</h1>
        <p>Status: <strong>{existing.status}</strong></p>
        <Link to="/seller/dashboard" className="btn btn-primary">Go to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Become a Seller</h1>
      <p className="muted">
        Apply to sell on the marketplace. After admin approval you can list products and
        manage your listings.
      </p>
      <form onSubmit={onSubmit} className="form" style={{ maxWidth: 560 }}>
        <label>
          Business name *
          <input
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            required
            placeholder="TechMart Elektronik"
          />
        </label>
        <label>
          Tax ID *
          <input
            value={form.taxId}
            onChange={(e) => update("taxId", e.target.value)}
            required
            placeholder="1234567890"
          />
        </label>
        <label>
          IBAN *
          <input
            value={form.iban}
            onChange={(e) => update("iban", e.target.value)}
            required
            placeholder="TR00 0000 0000 0000 0000 0000 00"
          />
        </label>
        <label>
          Contact email
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => update("contactEmail", e.target.value)}
            placeholder="seller@example.com"
          />
        </label>
        <label>
          Contact phone
          <input
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
            placeholder="+90 555 000 0000"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </form>
    </div>
  );
}
