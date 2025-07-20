USE MXHSV;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  full_name NVARCHAR(100),
  nickname VARCHAR(100),
  birthday DATE,
  address VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE 
      ON UPDATE CASCADE
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title NVARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT,
  user_id INT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE conversations (   
  id INT AUTO_INCREMENT PRIMARY KEY,
  is_group BOOLEAN DEFAULT FALSE,
  name VARCHAR(100),          
  admin_id INT,               
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE conversation_members (
  conversation_id INT,
  user_id INT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT,
  sender_id INT,
  text TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE message_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT,
  type ENUM('image', 'file', 'video', 'audio'),
  url TEXT,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE message_reads (
  message_id INT,
  user_id INT,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (email, password_hash)
VALUES
('vana@example.com', 'hashedpassword1'),
('thib@example.com', 'hashedpassword2'),
('lec@example.com', 'hashedpassword3'),
('phamd@example.com', 'hashedpassword4'),
('hoange@example.com', 'hashedpassword5');

INSERT INTO profile (user_id, full_name, nickname, birthday, address, bio, avatar_url) VALUES
(1, N'Nguyễn Văn A', 'VanA', '2002-05-10', 'Hà Nội', N'Sinh viên yêu thích lập trình web và game.', 'http://localhost:5000/uploads/1752728364665-user_1.png'),
(2, N'Trần Thị B', 'ThiB', '2001-08-22', 'TP. HCM', N'Tôi thích học React, Node.js và phát triển game bằng Unity.', 'http://localhost:5000/uploads/1752728522231-user_2.jpg'),
(3, N'Lê Văn C', 'VanC', '2000-11-03', 'Đà Nẵng', N'Đam mê AI và Machine Learning.', 'demo_avatar.jpg'),
(4, N'Phạm Thị D', 'ThiD', '2003-02-15', 'Hải Phòng', N'Yêu thích thiết kế UI/UX.', 'demo_avatar.jpg'),
(5, N'Hoàng Văn E', 'VanE', '1999-09-29', 'Cần Thơ', N'Chuyên gia về DevOps và Cloud.', 'demo_avatar.jpg');

INSERT INTO posts (user_id, title, content) VALUES
(1, N'Giới thiệu về bản thân', N'Xin chào, tôi là sinh viên đam mê lập trình.'),
(2, N'Chia sẻ tài liệu học lập trình', N'Tôi sẽ chia sẻ một số tài liệu học HTML, CSS và JavaScript.'),
(1, N'Hướng dẫn cài đặt MySQL', N'Trong bài viết này, tôi sẽ hướng dẫn cách cài đặt MySQL trên Windows.'),
(2, N'Kinh nghiệm học ReactJS', N'ReactJS giúp việc xây dựng giao diện web trở nên hiệu quả hơn.'),
(1, N'Tạo API với Node.js', N'Bài viết hướng dẫn cách tạo một REST API cơ bản bằng Node.js và Express.');

CREATE TABLE friend_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (sender_id, receiver_id),
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Dữ liệu mẫu cho friend_requests
INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES
(1, 2, 'accepted'),  -- A và B đã là bạn
(3, 1, 'pending'),   -- C gửi lời mời cho A
(4, 1, 'pending');   -- D gửi lời mời cho A
