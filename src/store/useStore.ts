import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_avaliacoes: number;
  regiao_id: string | null;
  status: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  regiaoSelecionada: string;
  favoritos: string[];
  searchQuery: string;
  categoriaFiltro: string | null;
  unreadNotifications: number;
  filterGratuito: boolean;
  filterRegiao: string;
  filterCategoria: string;

  setAuth: (user: User | null, profile: Profile | null) => void;
  logout: () => void;
  setProfile: (profile: Profile | null) => void;
  setIsAdmin: (val: boolean) => void;
  setIsSuperAdmin: (val: boolean) => void;
  setRegiao: (id: string) => void;
  toggleFavorito: (anuncioId: string) => void;
  setSearchQuery: (q: string) => void;
  setCategoriaFiltro: (id: string | null) => void;
  setUnreadNotifications: (count: number) => void;
  setFilterGratuito: (val: boolean) => void;
  setFilterRegiao: (val: string) => void;
  setFilterCategoria: (val: string) => void;
  clearFilters: () => void;
}

export const useStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  profile: null,
  isAdmin: false,
  isSuperAdmin: false,
  regiaoSelecionada: '1',
  favoritos: [],
  searchQuery: '',
  categoriaFiltro: null,
  unreadNotifications: 0,
  filterGratuito: false,
  filterRegiao: '',
  filterCategoria: '',

  setAuth: (user, profile) => set({ isAuthenticated: !!user, user, profile }),
  logout: () => set({ isAuthenticated: false, user: null, profile: null, isAdmin: false, isSuperAdmin: false, unreadNotifications: 0 }),
  setProfile: (profile) => set({ profile }),
  setIsAdmin: (val) => set({ isAdmin: val }),
  setIsSuperAdmin: (val) => set({ isSuperAdmin: val }),
  setRegiao: (id) => set({ regiaoSelecionada: id }),
  toggleFavorito: (anuncioId) =>
    set((state) => ({
      favoritos: state.favoritos.includes(anuncioId)
        ? state.favoritos.filter((id) => id !== anuncioId)
        : [...state.favoritos, anuncioId],
    })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCategoriaFiltro: (id) => set({ categoriaFiltro: id }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  setFilterGratuito: (val) => set({ filterGratuito: val }),
  setFilterRegiao: (val) => set({ filterRegiao: val }),
  setFilterCategoria: (val) => set({ filterCategoria: val }),
  clearFilters: () => set({ searchQuery: '', categoriaFiltro: null, filterGratuito: false, filterRegiao: '', filterCategoria: '' }),
}));
