import { useState } from 'react';
import Button from '../components/Button';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const handleRegister = async () => {
    if (password !== rePassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Đăng ký thất bại');

      alert('Đăng ký thành công!');
      setEmail('');
      setPassword('');
      setRePassword('');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đăng ký');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#777777]">
      <div className="flex rounded-[2rem] overflow-hidden shadow-2xl w-[45rem] h-[25rem] bg-white">
        {/* Phần form */}
        <div className="flex flex-col flex-1 px-8 py-6">
          <h1 className="text-center text-2xl font-semibold text-[#0F0F0F] mb-6">ĐĂNG KÝ</h1>

          <input
            type="email"
            placeholder="Email"
            className="mb-4 px-4 py-2 rounded-md shadow-inner bg-[#D9D9D9] placeholder:text-[#555]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="mb-4 px-4 py-2 rounded-md shadow-inner bg-[#D9D9D9] placeholder:text-[#555]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            className="mb-6 px-4 py-2 rounded-md shadow-inner bg-[#D9D9D9] placeholder:text-[#555]"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
          />

          <Button
            onClick={handleRegister}
            className="mx-auto w-[8rem] h-[2.75rem] text-white bg-[#00A6FB] rounded-full shadow-lg"
          >
            ĐĂNG KÝ
          </Button>
        </div>

        {/* Phần logo */}
        <div className="flex flex-col justify-center items-center w-[40%] bg-[#0582CA]">
          <div className="bg-[#EEE] w-[8rem] h-[8rem] rounded-full flex items-center justify-center">
            <div className="text-center font-semibold text-sm">
              <img src="../../public/demo_avatar.jpg" alt="Logo" className="w-10 h-10 mx-auto mb-1" />
              CHÉMNET
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
