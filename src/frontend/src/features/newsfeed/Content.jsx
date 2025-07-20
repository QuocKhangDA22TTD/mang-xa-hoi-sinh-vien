import Newsfeed from '../../pages/Newsfeed';
import CreatePostPage from '../../pages/CreatePostPage';

function Content({ currentView, setCurrentView }) {
  return (
    <div className="w-[60%] h-[100%] mx-1 rounded-[3px]">
      {currentView === 'newsfeed' ? (
        <Newsfeed onCreatePost={() => setCurrentView('create-post')} />
      ) : (
        <CreatePostPage onBack={() => setCurrentView('newsfeed')} />
      )}
    </div>
  );
}

export default Content;
