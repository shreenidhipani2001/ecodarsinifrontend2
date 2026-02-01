

"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ProductsCatalogue from "./ProductsCatalogue";
import OrdersGrid from "./OrdersGrid";
import PaymentsList from "./PaymentsList";
import type { AdminSection } from "./types";

export default function AdminLayout() {
  const [active, setActive] = useState<AdminSection>("products");

  return (
    <div className="flex min-h-screen bg-zinc-100">
 
      <h1 className="text-3xl font-bold text-gray-800 m-auto">
        Admin Layout Under Construction
      </h1>
    </div>
  );
}
