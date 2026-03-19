"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flag,
} from "lucide-react";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  ChannelType,
  SentimentScore,
  getStatusColor,
  getPriorityColor,
  getSentimentColor,
  getChannelColor,
} from "@/types/admin";
import { getTickets } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface TicketsTableProps {
  filters: {
    channel?: ChannelType;
    status?: TicketStatus;
    priority?: TicketPriority;
    search?: string;
  };
  onTicketClick: (ticket: Ticket) => void;
}

const channelIcons: Record<ChannelType, string> = {
  whatsapp: "💬",
  gmail: "📧",
  webform: "🌐",
};

const sentimentEmojis: Record<SentimentScore, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😠",
};

export default function TicketsTable({
  filters,
  onTicketClick,
}: TicketsTableProps) {
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch tickets
  useEffect(() => {
    setLoading(true);
    getTickets(filters, pagination.pageIndex + 1, pagination.pageSize)
      .then((response) => {
        setData(response.items);
      })
      .catch((err) => {
        // Suppress 404 errors (backend not ready)
        if (err.status !== 404) {
          console.error("Failed to fetch tickets:", err);
        }
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [filters, pagination.pageIndex, pagination.pageSize]);

  // Table columns
  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "ticketId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            Ticket ID
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono font-bold text-primary">
            {row.getValue("ticketId")}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            Customer
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">
              {row.getValue("customerName")}
            </div>
            <div className="text-sm text-muted-foreground">
              {row.original.customerEmail}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => {
          const channel = row.getValue("channel") as ChannelType;
          return (
            <div className="flex items-center gap-2">
              <span className="text-xl">{channelIcons[channel]}</span>
              <span className={`capitalize ${getChannelColor(channel)}`}>
                {channel}
              </span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <span className="text-foreground max-w-xs truncate block">
            {row.getValue("subject")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            Status
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as TicketStatus;
          return (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} bg-opacity-10`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`} />
              <span className="capitalize">{status}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            Priority
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const priority = row.getValue("priority") as TicketPriority;
          return (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)} bg-opacity-10`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(priority)}`} />
              <span className="capitalize">{priority}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "sentiment",
        header: "Sentiment",
        cell: ({ row }) => {
          const sentiment = row.original.sentiment;
          const score = row.original.sentimentScore;
          return (
            <div className="flex items-center gap-2">
              <span className="text-xl">{sentimentEmojis[sentiment]}</span>
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getSentimentColor(sentiment).replace('text-', 'bg-')}`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            Created At
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const ticket = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTicketClick(ticket)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Resolve
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Escalate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="w-4 h-4 mr-2" />
                  Change Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onTicketClick]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: true,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-full h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-card/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence>
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => onTicketClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            data.length
          )}{" "}
          of {data.length} tickets
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border/50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border/50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
