import React from 'react';

interface ResourceItemProps {
  title: string;
  description: React.ReactNode;
  link: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ title, description, link }) => {
  return (
    <li className="flex flex-row align-center">
      <p className="p-0 mt-0 mb-4">
        <a className="font-semibold no-underline text-black" href={link}>
          {title}
        </a>
        : {description}
      </p>
    </li>
  );
};

export default ResourceItem;