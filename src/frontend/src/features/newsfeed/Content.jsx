import Newsfeed from '../../pages/Newsfeed';
import CreatePostPage from '../../pages/CreatePostPage';

function Content({ currentView, setCurrentView }) {
  return (
    <div className="w-full space-y-6">
      {currentView === 'newsfeed' ? (
        <Newsfeed onCreatePost={() => setCurrentView('create-post')} />
      ) : (
        <CreatePostPage onBack={() => setCurrentView('newsfeed')} />
      )}
    </div>
  );
}

export default Content;
