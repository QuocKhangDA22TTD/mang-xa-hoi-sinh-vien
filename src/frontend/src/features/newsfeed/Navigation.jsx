import CustomLink from '../../components/CustomLink';

function Navigation() {
  return (
    <>
      <CustomLink
        className="text-[3rem]"
        to={'/test'}
        iconName={'FaHome'}
        iconLib="fa"
      />

      <CustomLink
        className="text-[3rem]"
        to={'/'}
        iconName={'FaComment'}
        iconLib="fa"
      />

      <CustomLink
        className="text-[3rem]"
        to={'/'}
        iconName={'FaUserFriends'}
        iconLib="fa"
      />

      <CustomLink
        className="text-[3rem]"
        to={'/'}
        iconName={'FaBell'}
        iconLib="fa"
      />
    </>
  );
}

export default Navigation;
