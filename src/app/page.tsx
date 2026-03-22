"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import StatsRow from "../components/StatsRow";
import DataGrid from "../components/DataGrid";
import Sidebar from "../components/Sidebar";
import dynamic from 'next/dynamic';
import { mockLeads } from "../data/mockData";
import { Lead } from "../types/lead";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default to Paris
  const [mapRadius, setMapRadius] = useState<number>(5);

  const fetchCoordinates = async (location: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
      }
    } catch (e) {
      console.error("Geocoding error", e);
    }
    return null;
  };

  const fetchLeads = async (sector: string, location: string, radiusKm: number = 5) => {
    setIsLoading(true);
    setLeads([]);
    setSelectedLead(null);
    setIsSidebarOpen(false);

    try {
      setMapRadius(radiusKm);
      const coords = await fetchCoordinates(location);
      let lat = mapCenter[0];
      let lng = mapCenter[1];

      if (coords) {
        setMapCenter(coords);
        lat = coords[0];
        lng = coords[1];
      }

      const response = await fetch(`/api/scan?sector=${encodeURIComponent(sector)}&location=${encodeURIComponent(location)}&radius=${radiusKm}&lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        console.error('Failed to fetch leads');
        // Fallback to mock data on error for demo purposes
        setLeads(mockLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads(mockLeads);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setSession(session);
        // Load initial data only if authenticated
        fetchLeads("Restaurants", "Paris, FR", 5);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push("/login");
        } else {
          setSession(session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!session) {
    return null; // Return nothing while redirecting
  }

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedLead(null), 300); // Wait for transition
  };

  // Dynamically import map with ssr: false
  const Map = dynamic(() => import('../components/Map'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div> });

  const handleCenterChange = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden relative">
      <header className="z-20 flex w-full flex-col shadow-sm">
        <Header />
        <SearchSection onScan={fetchLeads} isLoading={isLoading} />
      </header>

      <main className="flex-1 overflow-auto bg-background-light p-6 dark:bg-background-dark">
        <div className="mx-auto max-w-[1400px]">
          <StatsRow leads={leads} />
          <div className="mb-6">
            <Map center={mapCenter} radiusKm={mapRadius} leads={leads} onCenterChange={handleCenterChange} />
          </div>
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
