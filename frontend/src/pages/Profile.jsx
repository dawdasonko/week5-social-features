import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Profile() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(res.data);
    } catch (err) {
      console.log("Failed to get profile", err);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await axios.get(`${API_URL}/follows/${id}/followers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFollowers(res.data);
    } catch (err) {
      console.log("Failed to get followers", err);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await axios.get(`${API_URL}/follows/${id}/following`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFollowing(res.data);
    } catch (err) {
      console.log("Failed to get following", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchFollowers();
    fetchFollowing();
  }, [id]);

  if (!profile) {
    return <div className="container">Loading profile...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2>{profile.name}</h2>
        <p>{profile.email}</p>

        <div className="actions">
          <span>Posts: {profile.posts_count}</span>
          <span>Followers: {profile.followers_count}</span>
          <span>Following: {profile.following_count}</span>
        </div>
      </div>

      <div className="card">
        <h3>Followers</h3>

        {followers.length === 0 && <p>No followers yet.</p>}

        {followers.map((user) => (
          <p key={user.id}>
            {user.name} - {user.email}
          </p>
        ))}
      </div>

      <div className="card">
        <h3>Following</h3>

        {following.length === 0 && <p>Not following anyone yet.</p>}

        {following.map((user) => (
          <p key={user.id}>
            {user.name} - {user.email}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Profile;