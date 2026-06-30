import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { normalizeSocialUrl } from '@/lib/storefront'

type SocialIconsProps = {
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  twitter?: string | null
}

const socialConfig = [
  {
    key: 'instagram',
    icon: FaInstagram,
    label: 'Instagram',
    fallbackPrefix: 'https://instagram.com/',
  },
  {
    key: 'facebook',
    icon: FaFacebook,
    label: 'Facebook',
    fallbackPrefix: 'https://facebook.com/',
  },
  {
    key: 'tiktok',
    icon: FaTiktok,
    label: 'TikTok',
    fallbackPrefix: 'https://tiktok.com/@',
  },
  {
    key: 'twitter',
    icon: FaXTwitter,
    label: 'X',
    fallbackPrefix: 'https://x.com/',
  },
] as const

export function SocialIcons({ instagram, facebook, tiktok, twitter }: SocialIconsProps) {
  const socials = { instagram, facebook, tiktok, twitter }

  const links = socialConfig
    .map(({ key, icon: Icon, label, fallbackPrefix }) => {
      const url = socials[key]?.trim()
      if (!url) {
        return null
      }

      return (
        <a
          key={key}
          href={normalizeSocialUrl(url, fallbackPrefix)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 transition-colors hover:text-white"
          aria-label={label}
        >
          <Icon className="h-5 w-5" />
        </a>
      )
    })
    .filter(Boolean)

  if (links.length === 0) {
    return null
  }

  return <div className="flex gap-4">{links}</div>
}
