import { parseVideoUrl } from '@/lib/video'

type ProductVideoProps = {
  videoUrl: string
  title: string
}

export function ProductVideo({ videoUrl, title }: ProductVideoProps) {
  const embed = parseVideoUrl(videoUrl)

  if (!embed) {
    return null
  }

  if (embed.type === 'direct') {
    return (
      <div className="overflow-hidden rounded-2xl bg-slate-100">
        <video
          src={embed.embedUrl}
          controls
          playsInline
          className="aspect-video w-full"
          title={title}
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-slate-100">
      <iframe
        src={embed.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full"
      />
    </div>
  )
}
