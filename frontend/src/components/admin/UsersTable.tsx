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
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Eye, Mail, Phone, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsers } from "@/lib/api/admin";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalTickets: number;
  lastActive: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
}

interface UsersTableProps {
  onUserClick: (userId: string) => void;
}

const sentimentEmojis: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😠",
};

export default function UsersTable({ onUserClick }: UsersTableProps) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    getUsers(1, 50)
      .then((response) => {
        setData(response.items || []);
      })
      .catch((err) => {
        if (err.status !== 404) {
          console.error("Failed to fetch users:", err);
          toast.error("Failed to load users");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            User
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">
              {row.getValue("name")}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            {row.getValue("email")}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            {row.getValue("phone")}
          </div>
        ),
      },
      {
        accessorKey: "totalTickets",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            Tickets
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <span className="font-medium text-foreground">
              {row.getValue("totalTickets")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "lastActive",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-foreground hover:text-foreground"
          >
            Last Active
            <ArrowUpDown className="ml-2 w-4 h-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(row.getValue("lastActive")).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: "sentiment",
        header: "Sentiment",
        cell: ({ row }) => {
          const sentiment = row.getValue("sentiment") as string;
          const score = row.original.sentimentScore;
          return (
            <div className="flex items-center gap-2">
              <span className="text-xl">{sentimentEmojis[sentiment]}</span>
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    sentiment === "positive"
                      ? "bg-green-500"
                      : sentiment === "neutral"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUserClick(row.original.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          );
        },
      },
    ],
    [onUserClick]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(search) ||
        row.original.email.toLowerCase().includes(search)
      );
    },
    state: {
      sorting,
      globalFilter,
    },
  });

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-12 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            No Users Found
          </h3>
          <p className="text-muted-foreground">
            Users will appear here when fetched from the backend API.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search users..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm bg-background/50 border-border/50"
        />
        <div className="text-sm text-muted-foreground">
          {data.length} total users
        </div>
      </div>

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
                  className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onUserClick(row.original.id)}
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
          Showing {table.getRowModel().rows.length} users
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
