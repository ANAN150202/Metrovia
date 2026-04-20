// User profile page with posts and info tabs
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfilePostGrid from "../components/profile/ProfilePostGrid";
import Spinner from "../components/common/Spinner";
import api from "../services/api";

const ProfilePage = () => {
  const { id }   = useParams();
  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts,       setPosts]       = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const isOwn = user?._id === id;

  // Fetch profile user
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = isOwn
          ? await api.get("/api/users/me")
          : await api.get(`/api/users/${id}`);
        setProfileUser(isOwn ? res.data.user : res.data.user);
      } catch {
        // silently fail
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [id, isOwn]);

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await api.get(`/api/posts/user/${id}`);
        setPosts(res.data.posts || []);
      } catch {
        // silently fail
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [id]);

  const handleProfileUpdate = (updatedUser) => {
    setProfileUser(updatedUser);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="card p-10 text-center">
        <p className="text-gray-900 dark:text-white font-semibold">User not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ProfileHeader
        profileUser={profileUser}
        isOwn={isOwn}
        onUpdate={handleProfileUpdate}
      />
      <ProfileInfo profileUser={profileUser} />
      <ProfilePostGrid
        posts={posts}
        loading={loadingPosts}
        onDelete={isOwn ? handlePostDeleted : undefined}
      />
    </div>
  );
};

export default ProfilePage;