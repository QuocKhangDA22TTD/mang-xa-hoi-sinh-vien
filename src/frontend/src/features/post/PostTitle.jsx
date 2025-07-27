import Input from '../../components/Input';

function PostTitle({ title, setTitle }) {
  return (
    <Input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Tiêu đề bài viết..."
      className="w-full px-4 py-3 text-lg font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
    />
  );
}

export default PostTitle;
