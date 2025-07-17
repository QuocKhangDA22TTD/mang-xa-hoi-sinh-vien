import Header from '../features/newsfeed/Header';
import LeftBar from '../features/newsfeed/LeftBar';
import Content from '../features/newsfeed/Content';
import RightBar from '../features/newsfeed/RightBar';

function HomePage() {
  return (
    <div className="w-[100%] h-[100vh] bg-gradient-to-b from-[#FFFFFF] to-[#00A6FB]">
      <Header />
      <div className="w-[100%] h-[90%] p-4">
        <div className="flex w-[100%] h-[100%]">
          <LeftBar />
          <Content />
          <RightBar />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
