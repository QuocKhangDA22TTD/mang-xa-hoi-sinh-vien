import DOMPurify from 'dompurify';
import CustomLink from '../../components/CustomLink';

function Article({ userName, title, avatarUrl, createdAt, content }) {
  const safeContent = DOMPurify.sanitize(content);

  return (
    <div className="w-[100%] h-auto bg-[#EEEBD3] mb-4 rounded-[10px] border border-[#726A6A] border-opacity-25 shadow-[0_0_8px_4px_rgba(0,0,0,0.25)]">
      <div className="flex w-[100%] h-[100%] p-4 w-[100%] h-[15%]">
        <div className="flex w-[70%] h-[100%] flex items-center font-bold">
          <img
            className="w-[3rem] h-[3rem] mr-2 rounded-[100%] border-4 border-[#EEEBD3] border-opacity-100 shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
            src={avatarUrl || 'demo_avatar.jpg'}
            alt="avatar"
          />
          {userName}
        </div>
        <div className="flex justify-end items-center w-[30%] h-[100%]">
          {new Date(createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>
      <div
        className="text-center font-bold uppercase"
        style={{ fontSize: '24px' }}
      >
        {title}
      </div>
      <div
        className="text-justify p-4"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      ></div>

      <div className="flex justify-between mt-4 bg-[#FDFDFD] p-4 shadow-[0_0_2px_0_rgba(0,0,0,0.25)]">
        <div className="flex">
          <div className="flex items-end mr-2" style={{ fontSize: '22px' }}>
            24
          </div>
          <CustomLink
            iconName={'FaThumbsUp'}
            iconLib="fa"
            style={{ fontSize: '32px' }}
          />
        </div>
        <div>
          <CustomLink className="py-2 px-4 bg-[#A98743] rounded-[25px] text-[#FFFFFF] border border-[#000000] border-opacity-25 shadow-[0_2px_0_1px_rgba(0,0,0,0.25)]">
            Comment
          </CustomLink>
        </div>
      </div>
    </div>
  );
}

export default Article;
