const postModel = require('../models/postModel');

const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel.getAllPosts();
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error getting posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await postModel.getPostsByUserId(userId);

    // Trả mảng rỗng nếu không có bài viết
    res.status(200).json(posts || []);
  } catch (err) {
    console.error('Error getting posts by user id:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { user_id, title, content } = req.body;

    if (!user_id || !title || !content) {
      return res
        .status(400)
        .json({ message: 'Missing user_id, title or content' });
    }

    const postId = await postModel.createPost(user_id, title, content);

    res.status(201).json({
      message: 'Post created successfully',
      postId,
    });
    console.log('req.body:', req.body);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error' });
    console.log('req.body:', req.body);
  }
};

module.exports = { getAllPosts, getPostsByUserId, createPost };
