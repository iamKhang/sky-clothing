'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginateProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Paginate({ currentPage, totalPages, onPageChange }: PaginateProps) {
  const renderPageNumbers = () => {
    const pages = []
    const ellipsis = <Button variant="ghost" size="icon" disabled><MoreHorizontal className="h-4 w-4" /></Button>

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        )
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(i)}
            >
              {i}
            </Button>
          )
        }
        pages.push(ellipsis)
        pages.push(
          <Button
            key={totalPages}
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        )
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          <Button
            key={1}
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
        )
        pages.push(ellipsis)
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(i)}
            >
              {i}
            </Button>
          )
        }
      } else {
        pages.push(
          <Button
            key={1}
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
        )
        pages.push(ellipsis)
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(i)}
            >
              {i}
            </Button>
          )
        }
        pages.push(ellipsis)
        pages.push(
          <Button
            key={totalPages}
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        )
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {renderPageNumbers()}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

