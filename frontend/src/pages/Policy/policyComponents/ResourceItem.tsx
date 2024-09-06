<<<<<<< HEAD
import type React from 'react';
=======
<<<<<<< HEAD
import React from 'react';
=======
import type React from 'react';
>>>>>>> ad9403cb (Policy hub content enhancements and route config updates (#3625))
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))

interface ResourceItemProps {
  title: string;
  description: React.ReactNode;
<<<<<<< HEAD
  link?: string;
=======
<<<<<<< HEAD
  link: string;
=======
  link?: string;
>>>>>>> ad9403cb (Policy hub content enhancements and route config updates (#3625))
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))
}

const ResourceItem: React.FC<ResourceItemProps> = ({ title, description, link }) => {
  return (
<<<<<<< HEAD
=======
<<<<<<< HEAD
    <li className="flex flex-row align-center">
      <p className="p-0 mt-0 mb-4">
        <a className="font-semibold no-underline text-black" href={link}>
          {title}
        </a>
=======
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))
    <li className='flex flex-row align-center'>
      <p className='p-0 mt-0 mb-4'>
        {link ? (
          <a className='font-semibold no-underline text-black' href={link}>
            {title}
          </a>
        ) : (
          <span className='font-semibold text-black'>{title}</span>
        )}
<<<<<<< HEAD
=======
>>>>>>> ad9403cb (Policy hub content enhancements and route config updates (#3625))
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))
        : {description}
      </p>
    </li>
  );
};

export default ResourceItem;