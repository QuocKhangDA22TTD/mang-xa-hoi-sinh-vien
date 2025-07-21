import { useEffect, useState } from 'react';
import Article from './Article';

function ArticlesList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/posts/')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error('Lỗi khi fetch:', err));
  }, []);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Article
          key={post.id}
          title={post.title}
          userName={post.full_name}
          userId={post.user_id}
          avatarUrl={post.avatar_url}
          createdAt={post.created_at}
          content={post.content}
        />
      ))}
    </div>
  );
}

export default ArticlesList;
