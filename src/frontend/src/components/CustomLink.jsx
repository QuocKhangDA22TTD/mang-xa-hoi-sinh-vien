import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getIcon } from './IconMap';

function CustomLink({
  to,
  children,
  iconName,
  iconLib = 'fa',
  iconPosition = 'left',
  className = '',
  style = {},
  ...rest
}) {
  const Icon = iconName ? getIcon(iconLib, iconName) : null;

  return (
    <Link
      to={to}
      className={`inline-flex justify-center items-center hover:underline ${className}`}
      style={style}
      {...rest}
    >
      {Icon && iconPosition === 'left' && <Icon />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon />}
    </Link>
  );
}

CustomLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  iconName: PropTypes.string,
  iconLib: PropTypes.oneOf(['fa', 'md', 'ai']),
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default CustomLink;
