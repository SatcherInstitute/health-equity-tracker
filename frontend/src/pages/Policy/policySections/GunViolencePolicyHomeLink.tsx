import { HetOverline } from '../../../styles/HetComponents/HetOverline'

export default function GunViolencePolicyHomeLink() {
  return (
    <>
      <section className='relative'>
        <HetOverline text='In Focus' className='text-center' />
        <div className='flex w-full flex-col items-center justify-center'>
          <h1 className='font-sans-title text-alt-green text-bigger-header xs:text-header leading-modal-heading m-0 text-center font-bold'>
            Understanding the Crisis of Gun Violence in Atlanta
          </h1>

          <p className='text-title my-4 px-8 py-4 text-center lg:px-32 lg:py-8'>
            This pervasive public health challenge harms communities nationwide,
            disproportionately affecting Black communities. It's crucial to
            understand its impacts on mental, physical, and social health, often
            exacerbated by racial motives.
          </p>
          <article className='bg-alt-white shadow-raised mt-4 flex rounded-md px-8 pt-0 pb-8 lg:mt-8 lg:px-24'>
            <div className='flex flex-col items-center'>
              <img
                className='fade-in-up-blur mx-auto my-0 p-0'
                src='/img/graphics/DrSatcher.webp'
                alt='David Satcher, MD, PhD'
                loading='lazy'
                style={{ animationDelay: `${0.3}s` }}
              />

              <p
                className='fade-in-up-blur text-alt-green text-sansText text-text my-0 py-0 text-center font-bold'
                style={{ animationDelay: `${0.2}s` }}
              >
                David Satcher, M.D., Ph.D.
              </p>
              <p className='text-sansText text-small mt-0 mb-2 text-center'>
                Founding Director & Senior Advisor
              </p>

              <div className='relative text-center'>
                <span className='xs:-top-60 xs:-left-8 text-hover-alt-green absolute m-0 p-0 text-[20rem] md:-top-52 md:-left-4 lg:-top-56 lg:-left-20'>
                  &#10077;
                </span>
                <p
                  className='fade-in-up-blur font-roboto text-title my-0 leading-4'
                  style={{ animationDelay: `${0.4}s` }}
                >
                  Our children should be given a personal sense of security.
                  That’s not always there in communities of high poverty.
                  There’s a lot of insecurity. Often children turn to gangs and
                  guns because they feel insecure...we need to take the steps
                  necessary to protect them.
                </p>

                <p className='font-roboto text-title my-2 font-bold'>
                  Gun violence is a major public health problem.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
