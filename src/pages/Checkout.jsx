import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, uuid } from "../api/client";
import { useCart } from "../cart/CartContext";

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [card, setCard] = useState({
    holderName: "Alice Demo",
    number: "4111111111111111",
    expireMonth: "12",
    expireYear: "2030",
    cvc: "123",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const idemKey = uuid();
      const r = await api.post(
        "/api/orders",
        { card },
        { headers: { "Idempotency-Key": idemKey } }
      );
      const order = r.data || r;
      await refresh();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container narrow">
        <p>Your cart is empty. <a href="/">Go shopping</a>.</p>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h1>Checkout</h1>

      <section className="card">
        <h3>Order summary</h3>
        <ul className="summary">
          {cart.items.map((it) => (
            <li key={it.productId}>
              <span>
                {it.productName} × {it.quantity}
              </span>
              <span>
                {it.lineTotal} {it.priceCurrency}
              </span>
            </li>
          ))}
        </ul>
        <div className="summary-total">
          <span>Total</span>
          <strong>
            {cart.totalAmount} {cart.items[0]?.priceCurrency}
          </strong>
        </div>
      </section>

      <form onSubmit={onSubmit} className="form">
        <h3>Payment</h3>
        <p className="muted">
          Test cards — number ending in <code>1115</code> simulates a decline (saga compensation
          kicks in). Any other valid format succeeds.
        </p>
        <label>
          Name on card
          <input
            value={card.holderName}
            onChange={(e) => setCard({ ...card, holderName: e.target.value })}
            required
          />
        </label>
        <label>
          Card number
          <input
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\s+/g, "") })}
            required
            inputMode="numeric"
          />
        </label>
        <div className="row">
          <label>
            MM
            <input
              value={card.expireMonth}
              onChange={(e) => setCard({ ...card, expireMonth: e.target.value })}
              required
              maxLength={2}
            />
          </label>
          <label>
            YYYY
            <input
              value={card.expireYear}
              onChange={(e) => setCard({ ...card, expireYear: e.target.value })}
              required
              maxLength={4}
            />
          </label>
          <label>
            CVC
            <input
              value={card.cvc}
              onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              required
              maxLength={4}
            />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Placing order…" : `Place order — ${cart.totalAmount} ${cart.items[0]?.priceCurrency}`}
        </button>
      </form>
    </div>
  );
}
