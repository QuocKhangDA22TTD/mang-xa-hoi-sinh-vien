# Dùng image Node.js chính thức
FROM node:20

# Tạo thư mục app
WORKDIR /app

# Copy file package.json và package-lock.json (nếu có)
COPY package*.json ./


RUN npm install -g nodemon
# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Expose cổng 3000
EXPOSE 5000

# Lệnh chạy app
CMD ["npm", "start"]
