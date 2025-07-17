import CustomLink from '../components/CustomLink';
import ArticlesList from '../features/newsfeed/ArticlesList';

function Newsfeed() {
  return (
    <>
      <div className="flex items-center w-[100%] h-[15%] px-4 mb-2 rounded-[3px] bg-gradient-to-r from-[#0582CA] via-[#0295E4] to-[#0582CA] shadow-[0_0_8px_4px_rgba(0,0,0,0.25)]">
        <img
          className="w-[3rem] h-[3rem] mr-2 rounded-[100%] border-4 border-[#EEEBD3] border-opacity-100 shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
          src="demo_avatar.jpg"
          alt="logo"
        />
        <CustomLink
          to={'/create-post'}
          className="w-[100%] text-[#FFFFFF] bg-[#DAC1C1] p-2 rounded-[10px] border border-[#000000] border-opacity-25 shadow-[0_4px_8px_4px_rgba(0,0,0,0.25)]"
        >
          Bạn đang suy nghĩa gì?
        </CustomLink>
      </div>
      <div className="w-[100%] h-[83.5%] bg-[#F7ECEC] p-4 rounded-[3px] border border-[#000000] border-opacity-25 shadow-[0_0_8px_4px_rgba(0,0,0,0.25)] overflow-auto scroll-hide">
        <ArticlesList />
      </div>
    </>
  );
}

export default Newsfeed;
