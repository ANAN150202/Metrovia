// Main feed page: PostCreator + PostFeed
import { useState, useEffect } from "react";
import PostCreator from "../components/post/PostCreator";
import PostFeed from "../components/post/PostFeed";
import api from "../services/api";

const HomePage = () => {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/posts");
      setPosts(res.data.posts || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="animate-fade-in">
      <PostCreator onPostCreated={handlePostCreated} />
      <PostFeed
        posts={posts}
        loading={loading}
        onDelete={handlePostDeleted}
      />
    </div>
  );
};

export default HomePage;