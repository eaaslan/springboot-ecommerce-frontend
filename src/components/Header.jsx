import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">🛒 ecommerce</Link>
        <nav className="nav">
          <NavLink to="/">Catalog</NavLink>
          {user && <NavLink to="/orders">Orders</NavLink>}
          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/admin/products">Products</NavLink>
              <NavLink to="/admin/coupons">Coupons</NavLink>
            </>
          )}
        </nav>
        <div className="header-right">
          {user ? (
            <>
              <Link to="/cart" className="cart-pill">
                Cart {cart.itemCount > 0 && <span className="badge">{cart.itemCount}</span>}
              </Link>
              <span className="user">{user.email}</span>
              <button onClick={onLogout} className="link-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
