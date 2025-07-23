const profileModel = require('../models/profileModel');
const path = require('path');

exports.createProfile = async (req, res) => {
  const {
    full_name,
    bio,
    avatar_url,
    nickname,
    birthday,
    address,
    banner_url,
  } = req.body;
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
      address,
      banner_url
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
  const {
    full_name,
    bio,
    avatar_url,
    nickname,
    birthday,
    address,
    banner_url,
  } = req.body;
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
      address,
      banner_url
    );
    res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const user_id = req.user.id;
    const avatar_url = `http://localhost:5000/uploads/${req.file.filename}`;

    // Cập nhật avatar_url trong database
    let profile = await profileModel.getProfileByUserId(user_id);
    if (!profile) {
      // Tạo profile mới nếu chưa có
      await profileModel.createProfile(
        user_id,
        '',
        '',
        avatar_url,
        '',
        null,
        '',
        ''
      );
    } else {
      // Cập nhật profile hiện có
      await profileModel.updateProfile(
        user_id,
        profile.full_name,
        profile.bio,
        avatar_url,
        profile.nickname,
        profile.birthday,
        profile.address,
        profile.banner_url
      );
    }

    res.status(200).json({
      message: 'Upload avatar thành công',
      avatar_url: avatar_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Upload banner
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const user_id = req.user.id;
    const banner_url = `http://localhost:5000/uploads/${req.file.filename}`;

    // Cập nhật banner_url trong database
    let profile = await profileModel.getProfileByUserId(user_id);
    if (!profile) {
      // Tạo profile mới nếu chưa có
      await profileModel.createProfile(
        user_id,
        '',
        '',
        '',
        '',
        null,
        '',
        banner_url
      );
    } else {
      // Cập nhật profile hiện có
      await profileModel.updateProfile(
        user_id,
        profile.full_name,
        profile.bio,
        profile.avatar_url,
        profile.nickname,
        profile.birthday,
        profile.address,
        banner_url
      );
    }

    res.status(200).json({
      message: 'Upload banner thành công',
      banner_url: banner_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
