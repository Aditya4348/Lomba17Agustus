import React, { useState } from "react";
import { Competition } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInstance from "../lib/axios/axios";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useDebounce";

type CompetitionContextType = {
  competitions: Competition[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refreshCompetitions: () => void;
  searchCompetitions: string;
  setSearchCompetitions: (value: string) => void;
  updateCompetition: (competition: Competition) => void;
  isUpdating: boolean;
  deleteCompetition: (id: number) => void;
  isDeleting: boolean;
  createCompetition: (competition: Competition) => void;
  isCreating: boolean;
};


const CompetitionContext = React.createContext<
  CompetitionContextType | undefined
>(undefined);

export const CompetitionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // state untuk search kompetisi
  const [searchCompetitions, setSearchCompetitions] = useState("");
  const searchDebounced = useDebounce(searchCompetitions, 500);

  const queryClient = useQueryClient();

  // feach data kompetisi
  const {
    data: competitions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["competitions", searchDebounced],
    queryFn: async () => {
      const response = await apiInstance.get(
        `/competitions?search=${searchDebounced}`,
      );
      if (!response.status || response.status !== 200) {
        throw new Error("Failed to fetch competitions");
      }
      return response.data;
    },
    staleTime: 1 * 60 * 60 * 1000, // Data dianggap fresh selama 1 jam
    retry: false, // Tidak melakukan retry otomatis jika gagal
    enabled: !!localStorage.getItem("token"), // Hanya jalankan query jika token ada
    placeholderData: (previousData) => previousData, // Menjaga data lama saat loading pencarian baru
  });

  // mutation untuk create kompetisi
  const { mutate: createCompetition, isPending: isCreating } = useMutation({
    mutationFn: async (competition: Competition) => {
      const response = await apiInstance.post("/competitions", competition);
      if (!response.status || response.status !== 201) {
        throw new Error("Failed to create competition");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      toast.success(`Kompetisi ${data.name} berhasil dibuat`);
    },
    onError: (error) => {
      console.error("Error creating competition:", error);
      toast.error("Gagal membuat kompetisi. Silakan coba lagi.");
    },
  });

  // function untuk refresh data kompetisi
  const refreshCompetitions = () => {
    queryClient.invalidateQueries({ queryKey: ["competitions"] });
  };

  // function untuk update data kompetisi
  const { mutate: updateCompetition, isPending: isUpdating } = useMutation({
    mutationFn: async (competition: Competition) => {
      const response = await apiInstance.put(
        `/competitions/${competition.id}`,
        competition,
      );
      if (!response.status || response.status !== 200) {
        throw new Error("Failed to update competition");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      toast.success(`Kompetisi ${data.name} berhasil diperbarui`);
    },
    onError: (error) => {
      console.error("Error updating competition:", error);
      toast.error("Gagal memperbarui kompetisi. Silakan coba lagi.");
    },
  });

  // function untuk delete data kompetisi
  const { mutate: deleteCompetition, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiInstance.delete(`/competitions/${id}`);
      if (!response.status || response.status !== 200) {
        throw new Error("Failed to delete competition");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      toast.success("Kompetisi berhasil dihapus");
    },
    onError: (error) => {
      console.error("Error deleting competition:", error);
      toast.error("Gagal menghapus kompetisi. Silakan coba lagi.");
    },
  });

  return (
    <CompetitionContext.Provider
      value={{
        competitions,
        isLoading,
        error,
        refreshCompetitions,
        searchCompetitions,
        setSearchCompetitions,
        updateCompetition,
        isUpdating,
        deleteCompetition,
        isDeleting,
        createCompetition,
        isCreating,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => {
  const context = React.useContext(CompetitionContext);
  if (!context) {
    throw new Error("useCompetition must be used within a CompetitionProvider");
  }
    return context;
};
