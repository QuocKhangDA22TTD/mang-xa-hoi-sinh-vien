import CustomLink from '../../components/CustomLink';

function LeftBar() {
  return (
    <div className="w-[20%] h-[100%] bg-[#F7ECEC] mx-1 rounded-[3px] border border-[#000000] border-opacity-25 shadow-[0_0_8px_4px_rgba(0,0,0,0.25)]">
      <div className="flex justify-center items-center w-[100%] h-[13%] font-bold">
        <img
          className="w-[3rem] h-[3rem] mr-2 rounded-[100%] border-4 border-[#EEEBD3] border-opacity-100 shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
          src="demo_avatar.jpg"
          alt="logo"
        />
        Nguyễn Văn C
      </div>
      <div className="flex flex-col items-center gap-12 w-[100%] h-[87%] pt-6">
        <CustomLink className="w-[70%] h-[2rem] text-[#FFFFFF] bg-[#00A6FB] rounded-[10px] border border-[#000000] border-opacity-25 shadow-[0_2px_0_1px_rgba(0,0,0,0.25)]">
          HOT NHẤT NGÀY
        </CustomLink>
        <CustomLink className="w-[70%] h-[2rem] text-[#FFFFFF] bg-[#00A6FB] rounded-[10px] border border-[#000000] border-opacity-25 shadow-[0_2px_0_1px_rgba(0,0,0,0.25)]">
          NHIỀU LIKE NHẤT
        </CustomLink>
        <CustomLink className="w-[70%] h-[2rem] text-[#FFFFFF] bg-[#00A6FB] rounded-[10px] border border-[#000000] border-opacity-25 shadow-[0_2px_0_1px_rgba(0,0,0,0.25)]">
          MỚI NHẤT NGÀY
        </CustomLink>
        <CustomLink className="w-[70%] h-[2rem] text-[#FFFFFF] bg-[#00A6FB] rounded-[10px] border border-[#000000] border-opacity-25 shadow-[0_2px_0_1px_rgba(0,0,0,0.25)]">
          HOT NHẤT THÁNG
        </CustomLink>
        <CustomLink className="w-[70%] h-[2rem] text-[#FFFFFF] bg-[#00A6FB] rounded-[10px] border border-[#000000] border-opacity-25 shadow-[0_2px_0_1px_rgba(0,0,0,0.25)]">
          HOT NHẤT NĂM
        </CustomLink>
      </div>
    </div>
  );
}

export default LeftBar;
