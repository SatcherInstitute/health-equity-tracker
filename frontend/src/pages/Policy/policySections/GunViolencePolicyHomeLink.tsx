import { HetOverline } from '../../../styles/HetComponents/HetOverline'

export default function GunViolencePolicyHomeLink() {
  return (
    <>
      <section className='relative'>
        <HetOverline text='In Focus' className='text-center' />
        <div className='flex w-full flex-col items-center justify-center'>
          <h1 className='m-0 text-center font-bold font-sans-title text-alt-green text-bigger-header xs:text-header leading-modal-heading'>
            Understanding the Crisis of Gun Violence in Atlanta
          </h1>

          <p className='my-4 px-8 py-4 text-center text-title lg:px-32 lg:py-8'>
            This pervasive public health challenge harms communities nationwide,
            disproportionately affecting Black communities. It's crucial to
            understand its impacts on mental, physical, and social health, often
            exacerbated by racial motives.
          </p>
          <article className='mt-4 flex rounded-md bg-white px-8 pt-0 pb-8 shadow-raised lg:mt-8 lg:px-24'>
            <div className='flex flex-col align-center'>
              <img
                className='fade-in-up-blur mx-auto my-0 p-0'
                src='/img/graphics/DrSatcher.png'
                alt='David Satcher, MD, PhD'
                style={{ animationDelay: `${0.3}s` }}
              ></img>

              <p
                className='fade-in-up-blur my-0 py-0 text-center font-bold text-alt-green text-sansText text-text'
                style={{ animationDelay: `${0.2}s` }}
              >
                David Satcher, M.D., Ph.D.
              </p>
              <p className='mt-0 mb-2 text-center text-sansText text-small'>
                Founding Director & Senior Advisor
              </p>

              <div className='relative text-center'>
                <span className='xs:-top-60 xs:-left-8 md:-top-52 md:-left-4 lg:-top-56 lg:-left-20 absolute m-0 p-0 text-[20rem] text-hover-alt-green'>
                  &#10077;
                </span>
                <p
                  className='fade-in-up-blur my-0 font-roboto text-title leading-4'
                  style={{ animationDelay: `${0.4}s` }}
                >
                  Our children should be given a personal sense of security.
                  That’s not always there in communities of high poverty.
                  There’s a lot of insecurity. Often children turn to gangs and
                  guns because they feel insecure...we need to take the steps
                  necessary to protect them.
                </p>

                <p className='my-2 font-bold font-roboto text-title'>
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
