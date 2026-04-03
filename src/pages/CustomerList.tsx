import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCustomers } from "@/hooks/use-customers";
import type { Customer } from "@/types/customer";
import { PageHeader } from "@/components/layout";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { RefreshHint } from "@/components/feedback/RefreshHint";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomerList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { data: customerPayload, isLoading, isError, isFetching, refetch } = useCustomers(
    search,
    currentPage,
    perPage,
  );
  const customers = customerPayload?.data ?? [];
  const paginationMeta = customerPayload?.meta;

  const totalBookings = useMemo(
    () => customers.reduce((acc, customer) => acc + customer.bookingsCount, 0),
    [customers],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Customer list from scraped sources and operations"
        meta={`${customers.length} customers · ${totalBookings} linked bookings`}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <LoadingState layout="card" message="Loading customer table..." />
      ) : isError ? (
        <ErrorState title="Failed to load customers" onRetry={() => refetch()} />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing {customers.length} of {paginationMeta?.total ?? customers.length} customers
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="per-page" className="text-sm text-muted-foreground">
                Per page
              </label>
              <select
                id="per-page"
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                {[10, 25, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <TableCell className="font-medium">{customer.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.externalSource}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{customer.bookingsCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCustomer(customer);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && (paginationMeta?.lastPage ?? 1) > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if ((paginationMeta?.currentPage ?? 1) > 1) {
                    setCurrentPage((prev) => prev - 1);
                  }
                }}
                className={(paginationMeta?.currentPage ?? 1) === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: paginationMeta?.lastPage ?? 1 }).map((_, index) => {
              const page = index + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === (paginationMeta?.currentPage ?? 1)}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if ((paginationMeta?.currentPage ?? 1) < (paginationMeta?.lastPage ?? 1)) {
                    setCurrentPage((prev) => prev + 1);
                  }
                }}
                className={
                  (paginationMeta?.currentPage ?? 1) === (paginationMeta?.lastPage ?? 1)
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <RefreshHint active={isFetching && !isLoading} message="Refreshing customers..." />

      <Dialog open={Boolean(selectedCustomer)} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.fullName}</DialogTitle>
            <DialogDescription>Customer detail from scraped source and local operations.</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-right">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-right">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <span className="text-muted-foreground">Country</span>
                <span className="font-medium text-right">{selectedCustomer.countryCode}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium text-right">{selectedCustomer.externalSource}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <span className="text-muted-foreground">Source Ref</span>
                <span className="font-medium text-right">{selectedCustomer.externalCustomerRef}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Linked Bookings</span>
                <span className="font-semibold text-right">{selectedCustomer.bookingsCount}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
