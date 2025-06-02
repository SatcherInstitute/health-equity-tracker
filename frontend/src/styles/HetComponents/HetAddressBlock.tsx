interface AddressBlockProps {
  className?: string
}

export default function AddressBlock(props: AddressBlockProps) {
  return (
    <article
      className={`min-w-fit text-left font-sans-title text-small sm:text-text lg:text-title ${
        props.className ?? ''
      }`}
    >
      Morehouse School of Medicine
      <br />
      Satcher Health Leadership Institute
      <br />
      720 Westview Drive SW
      <br />
      Atlanta, Georgia 30310
      <p>
        <a className='no-underline hover:underline' href='tel:4047528654'>
          (404) 752-8654
        </a>
        <br />
        <a
          className='no-underline hover:underline'
          href='mailto:info@healthequitytracker.org'
        >
          info@healthequitytracker.org
        </a>
      </p>
    </article>
  )
}
