import type React from 'react';

interface ResourceItemProps {
  title: string;
  description: React.ReactNode;
  link?: string;
  icon?: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ title, description, link, icon }) => {
  return (
    <li className='rounded-md shadow-raised-tighter p-4'>
        {icon && <img src={icon} alt="icon" className="mr-2 w-6 h-6" />}
      <p className='p-0'>
        {link ? (
          <a className='font-semibold no-underline text-black text-exploreButton leading-lhNormal' href={link}>
            {title}
          </a>
        ) : (
          <span className='font-semibold text-black text-exploreButton leading-lhNormal'>{title}</span>
        )}
      </p>
      <p className='text-small'>
            {description}
      </p>
    </li>
  );
};

export default ResourceItem;