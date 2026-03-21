"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import StatsRow from "../components/StatsRow";
import DataGrid from "../components/DataGrid";
import Sidebar from "../components/Sidebar";
import { mockLeads } from "../data/mockData";
import { Lead } from "../types/lead";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLeads(mockLeads);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedLead(null), 300); // Wait for transition
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden relative">
      <header className="z-20 flex w-full flex-col shadow-sm">
        <Header />
        <SearchSection />
      </header>

      <main className="flex-1 overflow-auto bg-background-light p-6 dark:bg-background-dark">
        <div className="mx-auto max-w-[1400px]">
          <StatsRow />
          <DataGrid
            leads={leads}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            selectedLeadId={selectedLead?.id}
          />
        </div>
      </main>

      <Sidebar
        lead={selectedLead}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}
