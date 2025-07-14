import { useState } from 'react';
import Button from '../components/Button';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');

      setMessage('Đăng nhập thành công!');
      console.log(data); // chứa token + user info
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#777777]">
      <div className="flex rounded-[2rem] overflow-hidden shadow-2xl w-[45rem] h-[20rem] bg-white">
        {/* Phần logo */}
        <div className="flex flex-col justify-center items-center w-[40%] bg-[#0582CA]">
          <div className="bg-[#EEE] w-[6rem] h-[6rem] rounded-full flex items-center justify-center">
            <div className="text-center font-semibold text-xs text-black">
              <img src="../../public/demo_avatar.jpg" alt="Logo" className="w-8 h-8 mx-auto mb-1" />
              CHÉMNET
            </div>
          </div>
        </div>

        {/* Phần form */}
        <div className="flex flex-col flex-1 px-8 py-6 justify-center">
          <h1 className="text-center text-xl font-semibold text-[#0F0F0F] mb-6">ĐĂNG NHẬP</h1>

          <input
            type="email"
            placeholder="Email"
            className="mb-4 px-4 py-2 rounded-md shadow-inner bg-[#D9D9D9] placeholder:text-[#555]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            className="mb-4 px-4 py-2 rounded-md shadow-inner bg-[#D9D9D9] placeholder:text-[#555]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            onClick={handleLogin}
            className="mx-auto w-[8rem] h-[2.75rem] text-white bg-[#00A6FB] rounded-full shadow-md"
          >
            ĐĂNG NHẬP
          </Button>

          {message && (
            <p className="text-center text-red-500 mt-3">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
