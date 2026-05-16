import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Users() {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(res.data);
    } catch (err) {
      console.log("Failed to get users", err);
    }
  };

  const followUser = async (userId) => {
    try {
      await axios.post(
        `${API_URL}/follows/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to follow user");
    }
  };

  const unfollowUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/follows/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unfollow user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <h2>All Users</h2>

      {users.map((user) => (
        <div className="card user-row" key={user.id}>
          <div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <Link to={`/profile/${user.id}`}>View Profile</Link>
          </div>

          {user.is_following === 1 ? (
            <button className="danger" onClick={() => unfollowUser(user.id)}>
              Unfollow
            </button>
          ) : (
            <button onClick={() => followUser(user.id)}>
              Follow
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Users;