import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="navbar">
      <h2>SocialHub</h2>

      <div className="links">
        <Link to="/feed">Feed</Link>
        <Link to="/users">Users</Link>
        {user && <Link to={`/profile/${user.id}`}>My Profile</Link>}
        <button className="danger" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;