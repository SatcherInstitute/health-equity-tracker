import type React from 'react';

interface ResourceItemCardProps {
  title: string;
  description: React.ReactNode;
  link?: string;
  icon?: string;
  reverse?: boolean;
}

const ResourceItemCard: React.FC<ResourceItemCardProps> = ({ title, description, link, icon, reverse }) => {
  return (
    <li
      className={`flex flex-row ${reverse ? 'flex-row-reverse' : ''} gap-4 items-center justify-center`}
    >
      <div className='rounded-md border border-solid border-methodologyGreen duration-300 ease-in-out shadow-raised-tighter bg-hoverAltGreen text-exploreButton p-4 no-underline flex flex-row items-center justify-start w-full'>
        {icon && <img src={icon} alt='icon' className='mr-4' />}
        <p className='p-0 leading-lhNormal'>
          {link ? (
            <a
              className='font-semibold no-underline text-black text-exploreButton leading-lhNormal'
              href={link}
            >
              {title}
            </a>
          ) : (
            <span className='font-semibold text-black text-exploreButton leading-lhNormal'>
              {title}
            </span>
          )}
        </p>
      </div>
      <p className='text-small w-fit py-0 my-0'>{description}</p>
    </li>
  );
}

export default ResourceItemCard;