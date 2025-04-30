import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PricingRowAction from "../row-action";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { IPackage } from "@/app/_models/package.model";
import { getPackageService } from "@/app/_services/package.service";
import { IBrowser } from "@/app/_models/browser.model";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { IUserByAdmin } from "@/app/_interface/user";

export default function PricingModel() {
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [userData, setUserData] = useState<any>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [browsers, setBrowsers] = useState<IBrowser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [user, setUser] = useState<IUserByAdmin>();
  const [isViewOpen, setIsViewOpen] = useState(false);

  const getPackage = async () => {
    setIsLoading(true);
    const packages = await getPackageService(
      pageIndex,
      pageSize,
      globalFilter as unknown as string
    );
    setPackages(packages.packages);
    setTotalPageCount(packages.total);
    setIsLoading(false);
  };

  const refreshPackages = () => {
    getPackage();
    setRowSelection({});
  };

  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ];

  let columns: ColumnDef<IPackage>[] = [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <div className="capitalize">{row.getValue("type")}</div>,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("description")}</div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("amount")}</div>
        ),
      },
      {
        accessorKey: "bugs",
        header: "Bugs",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("bugs")}</div>
        ),
      },
      {
        accessorKey: "testers",
        header: "Testers",
        // cell: ({ row }) => (
        //   <div>
        //     {
        //       <BrowsersList
        //         browsers={browsers}
        //         selectedBrowsers={row.getValue("browsers")}
        //       />
        //     }
        //   </div>
        // ),
      },
     
    ];

  const table = useReactTable({
    data: packages,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    state: {
      sorting,
      // globalFilter,
      columnVisibility,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of your pricing Models.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Testers</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Bugs</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Custom</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">
                {invoice.totalAmount}
              </TableCell>
              <TableCell>
                <PricingRowAction refreshPackages={refreshPackages} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
