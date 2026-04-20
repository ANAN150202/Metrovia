import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PageHeader from "../components/pages/PageHeader";
import PostCard from "../components/post/PostCard";
import PostCreator from "../components/post/PostCreator";
import Spinner from "../components/common/Spinner";
import api from "../services/api";

const SinglePageView = () => {
  const { id }   = useParams();
  const { user } = useAuth();

  const [page,         setPage]         = useState(null);
  const [posts,        setPosts]        = useState([]);
  const [loadingPage,  setLoadingPage]  = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoadingPage(true);
      try {
        const res = await api.get(`/api/pages/${id}`);
        setPage(res.data.page);
      } catch {
        // silently fail
      } finally {
        setLoadingPage(false);
      }
    };
    fetchPage();
  }, [id]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await api.get(`/api/pages/${id}/posts`);
        setPosts(res.data.posts || []);
      } catch {
        // silently fail
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [id]);

  const isOwner = page?.owner?._id === user?._id || page?.owner === user?._id;

  const handlePostCreated = (newPost) => setPosts((prev) => [newPost, ...prev]);
  const handlePostDeleted = (postId)  => setPosts((prev) => prev.filter((p) => p._id !== postId));
  const handlePageUpdate  = (updated) => setPage(updated);

  if (loadingPage) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  if (!page) {
    return (
      <div className="card p-10 text-center">
        <p className="text-gray-900 dark:text-white font-semibold">Page not found</p>
        <Link to="/pages" className="text-brand-500 text-sm mt-2 inline-block">Back to Pages</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/pages"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pages
      </Link>

      <PageHeader page={page} onPageUpdate={handlePageUpdate} />

      {isOwner && (
        <PostCreator onPostCreated={handlePostCreated} pageId={id} />
      )}

      {loadingPosts ? (
        <div className="flex justify-center py-10"><Spinner size="md" /></div>
      ) : posts.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-900 dark:text-white font-semibold text-sm">No posts yet</p>
          {isOwner && <p className="text-gray-400 text-xs mt-1">Share something with your members</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard pageOwnerId={page?.owner?._id} key={post._id} post={post} onDelete={isOwner ? handlePostDeleted : undefined} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SinglePageView;