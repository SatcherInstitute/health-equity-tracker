export interface ShareIconProps {
  size?: number
  iconFillColor?: string
  className?: string
}

export function FacebookIcon({
  size = 24,
  iconFillColor = 'currentColor',
  className,
}: ShareIconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={size}
      height={size}
      fill='none'
      stroke={iconFillColor}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
      focusable='false'
    >
      <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
    </svg>
  )
}

export function LinkedinIcon({
  size = 24,
  iconFillColor = 'currentColor',
  className,
}: ShareIconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={size}
      height={size}
      fill='none'
      stroke={iconFillColor}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
      focusable='false'
    >
      <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
      <rect width='4' height='12' x='2' y='9' />
      <circle cx='4' cy='4' r='2' />
    </svg>
  )
}

export function EmailIcon({
  size = 24,
  iconFillColor = 'currentColor',
  className,
}: ShareIconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={size}
      height={size}
      fill='none'
      stroke={iconFillColor}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
      focusable='false'
    >
      <rect width='20' height='16' x='2' y='4' rx='2' />
      <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
    </svg>
  )
}

export function openShareWindow(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
}

export function facebookShareUrl(pageUrl: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&hashtag=%23healthequity`
}

export function linkedinShareUrl(pageUrl: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`
}

export function emailShareUrl(pageUrl: string, subject: string, body: string) {
  const emailBody = (body + pageUrl).replace(/\n/g, '\r\n')
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
}
