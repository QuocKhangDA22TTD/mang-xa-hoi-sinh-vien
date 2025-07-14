const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file được tải lên' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ url: imageUrl });
};

module.exports = { uploadImage };
