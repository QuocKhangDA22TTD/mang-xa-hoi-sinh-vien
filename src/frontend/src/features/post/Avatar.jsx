function Avatar({ avatarUrl }) {
  return (
    <div className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-600 overflow-hidden">
      <img
        src={avatarUrl || '/demo_avatar.jpg'}
        alt="avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Avatar;
