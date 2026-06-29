import { Logo } from '@/components/ui/logo'

type AuthFormHeaderProps = {
  title: string
  description: string
}

export function AuthFormHeader({ title, description }: AuthFormHeaderProps) {
  return (
    <div className="space-y-4 pb-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-xl bg-white/95 px-3 py-2 shadow-sm">
          <Logo size="lg" priority />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-base text-white/80">{description}</p>
      </div>
    </div>
  )
}
