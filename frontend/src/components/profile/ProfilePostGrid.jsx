// Grid/list of the user's own posts
import PostFeed from "../post/PostFeed";

// Displays a user's posts on their profile page
// Uses the same PostFeed component as the home feed

const ProfilePostGrid = ({ posts, loading, onDelete }) => {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 font-display px-1">
        Posts
      </h2>
      <PostFeed posts={posts} loading={loading} onDelete={onDelete} />
    </div>
  );
};

export default ProfilePostGrid;