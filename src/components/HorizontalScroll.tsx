import { ReactNode, useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

interface HorizontalScrollProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  showArrows?: boolean
  snap?: boolean
}

export function HorizontalScroll({
  children,
  className,
  title,
  subtitle,
  showArrows = true,
  snap = true
}: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll)
      }
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={cn('relative', className)}>
      {title && (
        <div className="flex items-center justify-between mb-4 pr-8">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Left Arrow */}
      {showArrows && showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-card/90 backdrop-blur-sm border border-border text-text-secondary hover:text-text-primary hover:border-accent-purple/50 flex items-center justify-center shadow-lg transition-all md:hidden"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right Arrow */}
      {showArrows && showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-card/90 backdrop-blur-sm border border-border text-text-secondary hover:text-text-primary hover:border-accent-purple/50 flex items-center justify-center shadow-lg transition-all md:hidden"
          style={{ top: title ? 'calc(50% - 12px)' : '50%' }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className={cn(
          'flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0',
          snap && 'snap-x snap-mandatory'
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  )
}

// 横向滚动项包装器
export function HorizontalScrollItem({
  children,
  className,
  width = 'w-40'
}: {
  children: ReactNode
  className?: string
  width?: string
}) {
  return (
    <div className={cn('flex-shrink-0 snap-start', width, className)}>
      {children}
    </div>
  )
}
