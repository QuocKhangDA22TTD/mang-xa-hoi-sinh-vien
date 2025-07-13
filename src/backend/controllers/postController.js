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

const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await postModel.getPostById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error('Error getting post by id:', err);
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

module.exports = { getAllPosts, getPostById, createPost };
