// Maps and renders a list of PostCard components
import PostCard from "./PostCard";
import Spinner from "../common/Spinner";

const PostFeed = ({ posts, loading, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10 border border-brand-200 dark:border-brand-900/30 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-900 dark:text-white font-semibold text-sm">No posts yet</p>
        <p className="text-gray-400 text-xs mt-1">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default PostFeed;