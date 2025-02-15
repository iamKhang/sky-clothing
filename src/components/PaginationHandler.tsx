"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Paginate } from "./Paginate";

interface PaginationHandlerProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationHandler({ currentPage, totalPages }: PaginationHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <Paginate
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
} 