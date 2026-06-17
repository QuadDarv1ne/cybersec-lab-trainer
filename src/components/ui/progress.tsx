"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/10 dark:bg-primary/20 relative h-2.5 w-full overflow-hidden rounded-full shadow-inner",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-gradient-to-r from-primary to-primary/80 h-full w-full flex-1 transition-all duration-500 ease-out shadow-sm"
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          background: value && value > 75 
            ? 'linear-gradient(90deg, oklch(0.55 0.14 160), oklch(0.65 0.16 160))'
            : value && value > 40
            ? 'linear-gradient(90deg, oklch(0.60 0.12 190), oklch(0.55 0.14 160))'
            : 'linear-gradient(90deg, oklch(0.70 0.16 80), oklch(0.60 0.12 190))'
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
