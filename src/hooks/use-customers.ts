import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { Customer } from "@/types/customer";

interface CustomerApiItem {
  id: number | string;
  full_name: string;
  email: string | null;
  phone: string | null;
  country_code: string | null;
  external_source: string;
  external_customer_ref: string | null;
  bookings_count: number;
}

interface LaravelListResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CustomerListResult {
  data: Customer[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

function toCustomer(item: CustomerApiItem): Customer {
  return {
    id: String(item.id),
    fullName: item.full_name,
    email: item.email ?? "-",
    phone: item.phone ?? "-",
    countryCode: item.country_code ?? "-",
    externalSource: item.external_source,
    externalCustomerRef: item.external_customer_ref ?? "-",
    bookingsCount: item.bookings_count ?? 0,
  };
}

export function useCustomers(search?: string, page = 1, perPage = 10) {
  const queryParams = new URLSearchParams();
  if (search?.trim()) queryParams.set("search", search.trim());
  queryParams.set("page", String(page));
  queryParams.set("per_page", String(perPage));
  const query = queryParams.toString();

  return useQuery({
    queryKey: ["customers", query],
    queryFn: async () => {
      const payload = await apiGet<LaravelListResponse<CustomerApiItem>>(`/customers?${query}`);
      return {
        data: payload.data.map(toCustomer),
        meta: {
          currentPage: payload.meta?.current_page ?? page,
          lastPage: payload.meta?.last_page ?? 1,
          perPage: payload.meta?.per_page ?? perPage,
          total: payload.meta?.total ?? payload.data.length,
        },
      } satisfies CustomerListResult;
    },
  });
}
