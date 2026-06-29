import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white [a]:hover:bg-brand-700",
        secondary: "bg-brand-100 text-brand-700 [a]:hover:bg-brand-200",
        success: "bg-green-100 text-green-700 [a]:hover:bg-green-200",
        warning: "bg-amber-100 text-amber-700 [a]:hover:bg-amber-200",
        info: "bg-brand-100 text-brand-700 [a]:hover:bg-brand-200",
        destructive:
          "bg-red-100 text-red-700 focus-visible:ring-red-200 [a]:hover:bg-red-200",
        outline:
          "border-brand-200 text-brand-700 [a]:hover:bg-brand-50 [a]:hover:text-brand-800",
        ghost:
          "hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-50/50",
        link: "text-brand-600 underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
