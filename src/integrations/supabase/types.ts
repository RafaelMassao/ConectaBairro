export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      anuncios: {
        Row: {
          atualizado_em: string
          bairro_id: string | null
          categoria_id: string
          condicao: string | null
          criado_em: string
          data_evento: string | null
          deletado_em: string | null
          descricao: string
          expira_em: string | null
          gratuito: boolean
          id: string
          localizacao_texto: string
          preco: number | null
          recompensa: string | null
          regiao_id: string
          salario: string | null
          status: Database["public"]["Enums"]["status_anuncio"]
          subcategoria_id: string | null
          tipo_vaga: string | null
          titulo: string
          ultima_vez_visto: string | null
          urgente: boolean
          usuario_id: string
          visualizacoes: number
        }
        Insert: {
          atualizado_em?: string
          bairro_id?: string | null
          categoria_id: string
          condicao?: string | null
          criado_em?: string
          data_evento?: string | null
          deletado_em?: string | null
          descricao: string
          expira_em?: string | null
          gratuito?: boolean
          id?: string
          localizacao_texto?: string
          preco?: number | null
          recompensa?: string | null
          regiao_id: string
          salario?: string | null
          status?: Database["public"]["Enums"]["status_anuncio"]
          subcategoria_id?: string | null
          tipo_vaga?: string | null
          titulo: string
          ultima_vez_visto?: string | null
          urgente?: boolean
          usuario_id: string
          visualizacoes?: number
        }
        Update: {
          atualizado_em?: string
          bairro_id?: string | null
          categoria_id?: string
          condicao?: string | null
          criado_em?: string
          data_evento?: string | null
          deletado_em?: string | null
          descricao?: string
          expira_em?: string | null
          gratuito?: boolean
          id?: string
          localizacao_texto?: string
          preco?: number | null
          recompensa?: string | null
          regiao_id?: string
          salario?: string | null
          status?: Database["public"]["Enums"]["status_anuncio"]
          subcategoria_id?: string | null
          tipo_vaga?: string | null
          titulo?: string
          ultima_vez_visto?: string | null
          urgente?: boolean
          usuario_id?: string
          visualizacoes?: number
        }
        Relationships: [
          {
            foreignKeyName: "anuncios_bairro_id_fkey"
            columns: ["bairro_id"]
            isOneToOne: false
            referencedRelation: "bairros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_regiao_id_fkey"
            columns: ["regiao_id"]
            isOneToOne: false
            referencedRelation: "regioes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          anunciante_id: string
          comentario: string | null
          criado_em: string
          id: string
          rating: number
          usuario_id: string
        }
        Insert: {
          anunciante_id: string
          comentario?: string | null
          criado_em?: string
          id?: string
          rating: number
          usuario_id: string
        }
        Update: {
          anunciante_id?: string
          comentario?: string | null
          criado_em?: string
          id?: string
          rating?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_anunciante_id_fkey"
            columns: ["anunciante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bairros: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          nome: string
          regiao_id: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome: string
          regiao_id: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome?: string
          regiao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bairros_regiao_id_fkey"
            columns: ["regiao_id"]
            isOneToOne: false
            referencedRelation: "regioes"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          ativa: boolean
          criado_em: string
          icone: string | null
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          ativa?: boolean
          criado_em?: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          ativa?: boolean
          criado_em?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      denuncias: {
        Row: {
          anuncio_id: string
          criado_em: string
          descricao: string | null
          id: string
          motivo: string
          status: Database["public"]["Enums"]["status_denuncia"]
          usuario_id: string
        }
        Insert: {
          anuncio_id: string
          criado_em?: string
          descricao?: string | null
          id?: string
          motivo: string
          status?: Database["public"]["Enums"]["status_denuncia"]
          usuario_id: string
        }
        Update: {
          anuncio_id?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          motivo?: string
          status?: Database["public"]["Enums"]["status_denuncia"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          anuncio_id: string
          criado_em: string
          id: string
          usuario_id: string
        }
        Insert: {
          anuncio_id: string
          criado_em?: string
          id?: string
          usuario_id: string
        }
        Update: {
          anuncio_id?: string
          criado_em?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fotos: {
        Row: {
          anuncio_id: string
          criado_em: string
          id: string
          ordem: number
          url: string
          url_thumbnail: string | null
        }
        Insert: {
          anuncio_id: string
          criado_em?: string
          id?: string
          ordem?: number
          url: string
          url_thumbnail?: string | null
        }
        Update: {
          anuncio_id?: string
          criado_em?: string
          id?: string
          ordem?: number
          url?: string
          url_thumbnail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotos_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          anuncio_id: string | null
          criado_em: string
          id: string
          lida: boolean
          mensagem: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          anuncio_id?: string | null
          criado_em?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          tipo?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          anuncio_id?: string | null
          criado_em?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          atualizado_em: string
          avatar_url: string | null
          bio: string | null
          criado_em: string
          deletado_em: string | null
          email: string
          email_verificado: boolean
          id: string
          nome: string
          rating: number
          regiao_id: string | null
          status: Database["public"]["Enums"]["status_usuario"]
          total_avaliacoes: number
          whatsapp: string
        }
        Insert: {
          atualizado_em?: string
          avatar_url?: string | null
          bio?: string | null
          criado_em?: string
          deletado_em?: string | null
          email: string
          email_verificado?: boolean
          id: string
          nome?: string
          rating?: number
          regiao_id?: string | null
          status?: Database["public"]["Enums"]["status_usuario"]
          total_avaliacoes?: number
          whatsapp?: string
        }
        Update: {
          atualizado_em?: string
          avatar_url?: string | null
          bio?: string | null
          criado_em?: string
          deletado_em?: string | null
          email?: string
          email_verificado?: boolean
          id?: string
          nome?: string
          rating?: number
          regiao_id?: string | null
          status?: Database["public"]["Enums"]["status_usuario"]
          total_avaliacoes?: number
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_regiao_id_fkey"
            columns: ["regiao_id"]
            isOneToOne: false
            referencedRelation: "regioes"
            referencedColumns: ["id"]
          },
        ]
      }
      regioes: {
        Row: {
          ativa: boolean
          criado_em: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativa?: boolean
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativa?: boolean
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      subcategorias: {
        Row: {
          ativa: boolean
          categoria_id: string
          criado_em: string
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          ativa?: boolean
          categoria_id: string
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          ativa?: boolean
          categoria_id?: string
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_visualizacoes: {
        Args: { anuncio_uuid: string }
        Returns: undefined
      }
      is_admin_or_super: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
      status_anuncio: "ativo" | "pausado" | "expirado" | "removido"
      status_denuncia: "pendente" | "revisado" | "resolvido"
      status_usuario: "ativo" | "inativo" | "bloqueado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "super_admin"],
      status_anuncio: ["ativo", "pausado", "expirado", "removido"],
      status_denuncia: ["pendente", "revisado", "resolvido"],
      status_usuario: ["ativo", "inativo", "bloqueado"],
    },
  },
} as const
