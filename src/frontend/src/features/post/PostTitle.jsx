import Input from '../../components/Input';

function PostTitle({ title, setTitle }) {
  return (
    <Input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-[90%] h-[40%] rounded-[40px] text-[1.25rem] text-center uppercase p-4 outline-none border-[2px] border-[#00A6FB] shadow-[0_4px_8px_4px_rgba(0,0,0,0.25)]"
    ></Input>
  );
}

export default PostTitle;
