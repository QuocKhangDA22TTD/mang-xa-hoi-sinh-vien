import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as AiIcons from 'react-icons/ai';

const iconLibraries = {
  fa: FaIcons,
  md: MdIcons,
  ai: AiIcons,
};

export function getIcon(lib, name) {
  const icons = iconLibraries[lib];
  return icons?.[name] || null;
}
