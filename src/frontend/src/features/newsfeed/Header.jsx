import Input from '../../components/Input';
import Navigation from './Navigation';
import CustomLink from '../../components/CustomLink';
import useUserProfile from '../../hooks/useUserProfile';
import Button from '../../components/Button';

function Header({ setCurrentView }) {
  const { profile, loading } = useUserProfile();

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="flex w-[100%] h-[10%] px-5 bg-gradient-to-r from-[#0582CA] via-[#0295E4] to-[#0582CA] border border-[#000000] border-opacity-25 shadow-[0_4px_8px_4px_rgba(0,0,0,0.25)]">
      <div className="flex items-center w-[20%] h-[100%]">
        <CustomLink>
          <img
            className="w-[3rem] h-[3rem] mr-2 rounded-[100%] border border-[#000000] border-opacity-25 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
            src="demo_avatar.jpg"
            alt="logo"
          />
        </CustomLink>
        <Input
          className="w-[75%] h-[60%] rounded-[10px] text-center outline-none border border-[#000000] border-opacity-25 shadow-[0_4px_8px_4px_rgba(0,0,0,0.25)]"
          placeholder="Tìm Kiếm"
        />
      </div>
      <div className="flex justify-around w-[70%] h-[100%]">
        <Navigation setCurrentView={setCurrentView} />
      </div>
      <div className="flex justify-center items-center w-[10%] h-[100%]">
        <Button>
          <img
            className="w-[3rem] h-[3rem] rounded-[100%] border border-[#000000] border-opacity-25 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
            src={profile.avatar_url}
            alt="avatar"
          />
        </Button>
      </div>
    </div>
  );
}

export default Header;
