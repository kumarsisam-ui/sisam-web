import React from "react";
import { followUser, unfollowUser } from "./api";

export default function UserProfilePanel({
  profile,
  currentUser,
  isFollowing,
  onChangeFollow,
}) {
  if (!profile) return null;

  const username = profile.user.username;

  const handleFollow = async () => {
    if (!currentUser) return;
    await followUser(username, currentUser);
    if (onChangeFollow) onChangeFollow();
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;
    await unfollowUser(username, currentUser);
    if (onChangeFollow) onChangeFollow();
  };

  return (
    <div style={styles.box}>
      <h3>@{username}</h3>
      {profile.user.full_name && <p>{profile.user.full_name}</p>}

      <p>
        <b>{profile.posts_count}</b> posts ·{" "}
        <b>{profile.followers_count}</b> followers ·{" "}
        <b>{profile.following_count}</b> following
      </p>

      {currentUser && currentUser !== username && (
        <button
          style={styles.button}
          onClick={isFollowing ? handleUnfollow : handleFollow}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
}

const styles = {
  box: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 12,
    background: "#fff",
    marginTop: 10,
  },
  button: {
    marginTop: 8,
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "none",
    background: "#0095f6",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
