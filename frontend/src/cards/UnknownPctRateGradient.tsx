export default function UnknownPctRateGradient() {
  return (
    <svg
      height='0'
      width='0'
      version='1.1'
      aria-label='Unknown percentage rate gradient'
      role='img'
      xmlns='http://www.w3.org/2000/svg'
      style={{ position: 'absolute' }} // Ensures it doesn't take up space
    >
      <linearGradient id='gradient' className='unknown-gradient'>
        <stop offset='0%' />
        <stop offset='20%' />
        <stop offset='30%' />
        <stop offset='40%' />
        <stop offset='50%' />
        <stop offset='60%' />
        <stop offset='70%' />
        <stop offset='80%' />
        <stop offset='90%' />
        <stop offset='100%' />
      </linearGradient>
    </svg>
  )
}
