// import { useState } from 'react';
import './App.css';
import Input from './components/Input';
import { Button } from './components/Button';
import { Card } from './components/Card';
import {Modal} from './components/Modal';
import {Toast} from './components/Toast';
function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <Input />
      <Button children={'Đức tuổi'}/>
      <Card/>
      <Modal/>
      <Toast/>
      <h1>Khởi tạo dự án</h1>
    </>
  );
}

export default App;
