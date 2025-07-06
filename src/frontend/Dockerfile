
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng mặc định của Vite (3000)
EXPOSE 5173

# Chạy ứng dụng Vite
CMD ["npm", "run", "dev"]
