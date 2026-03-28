import * as React from 'react'
import { cn } from '../../lib/utils'

interface SliderProps {
  value: number[]
  max?: number
  min?: number
  step?: number
  onValueChange?: (value: number[]) => void
  className?: string
  disabled?: boolean
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, max = 100, min = 0, step = 1, onValueChange, className, disabled }, ref) => {
    const percentage = ((value[0] - min) / (max - min)) * 100

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return
      const rect = e.currentTarget.getBoundingClientRect()
      const handleMove = (moveEvent: MouseEvent) => {
        const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
        const newValue = percent * (max - min) + min
        const steppedValue = Math.round(newValue / step) * step
        onValueChange?.([Math.max(min, Math.min(max, steppedValue))])
      }
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
      // initial click
      handleMove(e)
    }

    return (
      <div
        ref={ref}
        className={cn('relative flex items-center w-full h-5 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}
        onMouseDown={handleMouseDown}
      >
        <div className="relative w-full h-1 bg-bg-secondary rounded-full">
          <div
            className="absolute h-full bg-accent-purple rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="absolute w-3 h-3 bg-white rounded-full shadow transition-transform hover:scale-125"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'
