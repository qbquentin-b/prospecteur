"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import StatsRow from "../components/StatsRow";
import DataGrid from "../components/DataGrid";
import Sidebar from "../components/Sidebar";
import dynamic from 'next/dynamic';
import { Lead } from "../types/lead";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default to Paris
  const [mapRadius, setMapRadius] = useState<number>(5);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load favorites on session load
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user) return;
      const { data } = await supabase
        .from('favorites')
        .select('lead_id')
        .eq('user_id', session.user.id);

      if (data) {
        setFavoriteIds(data.map(f => f.lead_id));
      }
    };
    if (session) fetchFavorites();
  }, [session]);

  const toggleFavorite = async (lead: Lead) => {
    if (!session?.user) return;

    const isFavorite = favoriteIds.includes(lead.id);

    // Optimistic UI update
    setFavoriteIds(prev =>
      isFavorite ? prev.filter(id => id !== lead.id) : [...prev, lead.id]
    );

    if (isFavorite) {
      // Remove
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('lead_id', lead.id);
    } else {
      // Add
      await supabase
        .from('favorites')
        .insert({
          user_id: session.user.id,
          lead_id: lead.id,
          lead_data: lead
        });
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeFilters.includes('no-website') && lead.techAudit.hasWebsite) return false;
    if (activeFilters.includes('low-rating') && lead.googleBusiness.rating >= 3.0) return false;
    if (activeFilters.includes('no-email') && lead.contact.email && lead.contact.email.length > 0) return false;
    if (activeFilters.includes('no-phone') && lead.contact.phone && lead.contact.phone.length > 0) return false;
    if (activeFilters.includes('unclaimed-gmb') && lead.googleBusiness.isClaimed) return false;
    return true;
  });

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

      const headers: Record<string, string> = {};
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/scan?sector=${encodeURIComponent(sector)}&location=${encodeURIComponent(location)}&radius=${radiusKm}&lat=${lat}&lng=${lng}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data);

        // Dispatch an event to update tokens in Header
        window.dispatchEvent(new CustomEvent('token-consumed', { detail: { cost: data.length } }));

        // Save scan to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('leadscanner_last_scan', JSON.stringify(data));
          localStorage.setItem('leadscanner_last_params', JSON.stringify({ sector, location, radiusKm }));
        }
      } else if (response.status === 403) {
        alert("Vous n'avez plus de tokens de recherche disponibles.");
      } else {
        console.error('Failed to fetch leads');
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      // Check for dev_bypass flag
      const devBypass = typeof window !== 'undefined' ? sessionStorage.getItem('dev_bypass') : null;

      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !devBypass) {
        router.push("/login");
      } else {
        setSession(session || { user: { id: 'dev_bypass_mock_id' } });

        // Attempt to load last scan from local storage to avoid consuming tokens on login
        if (typeof window !== 'undefined') {
          const cachedLeads = localStorage.getItem('leadscanner_last_scan');
          if (cachedLeads) {
            try {
              const parsedLeads = JSON.parse(cachedLeads);
              if (parsedLeads && Array.isArray(parsedLeads) && parsedLeads.length > 0) {
                setLeads(parsedLeads);
              }
            } catch (e) {
              console.error("Failed to parse cached scan data", e);
            }
          }
        }
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const devBypass = typeof window !== 'undefined' ? sessionStorage.getItem('dev_bypass') : null;
        if (!session && !devBypass) {
          router.push("/login");
        } else if (session) {
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

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const loadLastScan = () => {
    if (typeof window !== 'undefined') {
      const cachedLeads = localStorage.getItem('leadscanner_last_scan');
      if (cachedLeads) {
        try {
          const parsedLeads = JSON.parse(cachedLeads);
          if (parsedLeads && Array.isArray(parsedLeads) && parsedLeads.length > 0) {
            setLeads(parsedLeads);
            alert("Dernier scan chargé sans consommer de tokens.");
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached scan data", e);
        }
      }
    }

    alert("Aucune recherche précédente n'a été trouvée.");
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
        <SearchSection
          onScan={fetchLeads}
          isLoading={isLoading}
          isMapVisible={isMapVisible}
          onToggleMap={() => setIsMapVisible(!isMapVisible)}
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          onLoadLastScan={loadLastScan}
        />
      </header>

      <main className="flex-1 overflow-auto bg-background-light p-6 dark:bg-background-dark">
        <div className="mx-auto max-w-[1400px]">
          <StatsRow leads={filteredLeads} />
          {isMapVisible && (
            <div className="mb-6 transition-all duration-300 ease-in-out origin-top">
              <Map center={mapCenter} radiusKm={mapRadius} leads={filteredLeads} onCenterChange={handleCenterChange} />
            </div>
          )}
          <DataGrid
            leads={filteredLeads}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            selectedLeadId={selectedLead?.id}
            onToggleFavorite={toggleFavorite}
            favoriteIds={favoriteIds}
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
