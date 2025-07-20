const profileModel = require('../models/profileModel');

exports.createProfile = async (req, res) => {
  const { full_name, bio, avatar_url, nickname, birthday, address } = req.body;
  const user_id = req.user.id;

  try {
    const profile = await profileModel.getProfileByUserId(user_id);
    if (profile) return res.status(400).json({ message: 'Profile đã tồn tại' });

    await profileModel.createProfile(
      user_id,
      full_name,
      bio,
      avatar_url,
      nickname,
      birthday,
      address
    );
    res.status(201).json({ message: 'Tạo profile thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getProfile = async (req, res) => {
  const user_id = req.params.userId;

  try {
    const profile = await profileModel.getProfileByUserId(user_id);
    if (!profile)
      return res.status(404).json({ message: 'Không tìm thấy profile' });

    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateProfile = async (req, res) => {
  const { full_name, bio, avatar_url, nickname, birthday, address } = req.body;
  const user_id = req.user.id;

  try {
    const profile = await profileModel.getProfileByUserId(user_id);
    if (!profile)
      return res.status(404).json({ message: 'Profile chưa tồn tại' });

    await profileModel.updateProfile(
      user_id,
      full_name,
      bio,
      avatar_url,
      nickname,
      birthday,
      address
    );
    res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
