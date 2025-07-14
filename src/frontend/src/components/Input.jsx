function Input({
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  ...rest
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
  );
}

export default Input;
