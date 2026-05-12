import { het } from '../styles/theme/colorVars'

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
      <linearGradient id='gradient'>
        <stop stopColor={het.unknownMapMost} offset='0%' />
        <stop stopColor={het.unknownMapMid} offset='20%' />
        <stop stopColor={het.unknownMapMost} offset='30%' />
        <stop stopColor={het.unknownMapMid} offset='40%' />
        <stop stopColor={het.unknownMapMost} offset='50%' />
        <stop stopColor={het.unknownMapMid} offset='60%' />
        <stop stopColor={het.unknownMapMost} offset='70%' />
        <stop stopColor={het.unknownMapMid} offset='80%' />
        <stop stopColor={het.unknownMapMost} offset='90%' />
        <stop stopColor={het.unknownMapMid} offset='100%' />
      </linearGradient>
    </svg>
  )
}
