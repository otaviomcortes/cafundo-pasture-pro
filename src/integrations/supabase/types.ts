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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      descartes: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_descarte: string
          destino: string | null
          id: string
          lote_id: string | null
          matriz_id: string
          motivo: string | null
          observacoes: string | null
          peso: number | null
          tipo_descarte: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_descarte: string
          destino?: string | null
          id?: string
          lote_id?: string | null
          matriz_id: string
          motivo?: string | null
          observacoes?: string | null
          peso?: number | null
          tipo_descarte?: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_descarte?: string
          destino?: string | null
          id?: string
          lote_id?: string | null
          matriz_id?: string
          motivo?: string | null
          observacoes?: string | null
          peso?: number | null
          tipo_descarte?: string
        }
        Relationships: [
          {
            foreignKeyName: "descartes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes_frigorifico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descartes_matriz_id_fkey"
            columns: ["matriz_id"]
            isOneToOne: true
            referencedRelation: "matrizes"
            referencedColumns: ["id"]
          },
        ]
      }
      lote_frigorifico_matrizes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          lote_id: string
          matriz_id: string
          observacoes: string | null
          peso_final: number | null
          peso_inicial: number | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          lote_id: string
          matriz_id: string
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          lote_id?: string
          matriz_id?: string
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lote_frigorifico_matrizes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes_frigorifico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lote_frigorifico_matrizes_matriz_id_fkey"
            columns: ["matriz_id"]
            isOneToOne: false
            referencedRelation: "matrizes"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes_frigorifico: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_envio: string | null
          data_inicio_confinamento: string
          frigorifico: string | null
          id: string
          media_arrobas_frigorifico: number | null
          nome: string
          observacoes: string | null
          peso_total_informado: number | null
          status: string
          valor_recebido: number | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_envio?: string | null
          data_inicio_confinamento: string
          frigorifico?: string | null
          id?: string
          media_arrobas_frigorifico?: number | null
          nome: string
          observacoes?: string | null
          peso_total_informado?: number | null
          status?: string
          valor_recebido?: number | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_envio?: string | null
          data_inicio_confinamento?: string
          frigorifico?: string | null
          id?: string
          media_arrobas_frigorifico?: number | null
          nome?: string
          observacoes?: string | null
          peso_total_informado?: number | null
          status?: string
          valor_recebido?: number | null
        }
        Relationships: []
      }
      matrizes: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_nascimento: string | null
          id: string
          numero_brinco: string
          observacoes: string | null
          proprietario: string
          raca: string
          situacao_reprodutiva: string
          status: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_nascimento?: string | null
          id?: string
          numero_brinco: string
          observacoes?: string | null
          proprietario: string
          raca?: string
          situacao_reprodutiva: string
          status: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_nascimento?: string | null
          id?: string
          numero_brinco?: string
          observacoes?: string | null
          proprietario?: string
          raca?: string
          situacao_reprodutiva?: string
          status?: string
        }
        Relationships: []
      }
      partos: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_parto: string
          id: string
          matriz_id: string
          observacoes: string | null
          raca_bezerro: string
          sexo_bezerro: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_parto: string
          id?: string
          matriz_id: string
          observacoes?: string | null
          raca_bezerro: string
          sexo_bezerro: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_parto?: string
          id?: string
          matriz_id?: string
          observacoes?: string | null
          raca_bezerro?: string
          sexo_bezerro?: string
        }
        Relationships: [
          {
            foreignKeyName: "partos_matriz_id_fkey"
            columns: ["matriz_id"]
            isOneToOne: false
            referencedRelation: "matrizes"
            referencedColumns: ["id"]
          },
        ]
      }
      prenhezes: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_confirmacao: string
          id: string
          matriz_id: string
          observacoes: string | null
          origem: string
          status: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_confirmacao: string
          id?: string
          matriz_id: string
          observacoes?: string | null
          origem: string
          status: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_confirmacao?: string
          id?: string
          matriz_id?: string
          observacoes?: string | null
          origem?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "prenhezes_matriz_id_fkey"
            columns: ["matriz_id"]
            isOneToOne: false
            referencedRelation: "matrizes"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolo_matrizes: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_diagnostico: string | null
          diagnostico_prenhez: string
          etapa1_concluida: boolean
          etapa1_data: string | null
          etapa2_concluida: boolean
          etapa2_data: string | null
          etapa3_concluida: boolean
          etapa3_data: string | null
          id: string
          matriz_id: string
          observacoes: string | null
          protocolo_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_diagnostico?: string | null
          diagnostico_prenhez?: string
          etapa1_concluida?: boolean
          etapa1_data?: string | null
          etapa2_concluida?: boolean
          etapa2_data?: string | null
          etapa3_concluida?: boolean
          etapa3_data?: string | null
          id?: string
          matriz_id: string
          observacoes?: string | null
          protocolo_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_diagnostico?: string | null
          diagnostico_prenhez?: string
          etapa1_concluida?: boolean
          etapa1_data?: string | null
          etapa2_concluida?: boolean
          etapa2_data?: string | null
          etapa3_concluida?: boolean
          etapa3_data?: string | null
          id?: string
          matriz_id?: string
          observacoes?: string | null
          protocolo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocolo_matrizes_matriz_id_fkey"
            columns: ["matriz_id"]
            isOneToOne: false
            referencedRelation: "matrizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolo_matrizes_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos_iatf"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolos_iatf: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_etapa1: string
          data_etapa2: string
          data_etapa3: string
          data_fim_repasse: string | null
          data_inicio_repasse: string | null
          data_prevista_diagnostico: string
          id: string
          nome: string
          observacoes: string | null
          possui_repasse_touro: boolean
          status: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_etapa1: string
          data_etapa2: string
          data_etapa3: string
          data_fim_repasse?: string | null
          data_inicio_repasse?: string | null
          data_prevista_diagnostico: string
          id?: string
          nome: string
          observacoes?: string | null
          possui_repasse_touro?: boolean
          status: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_etapa1?: string
          data_etapa2?: string
          data_etapa3?: string
          data_fim_repasse?: string | null
          data_inicio_repasse?: string | null
          data_prevista_diagnostico?: string
          id?: string
          nome?: string
          observacoes?: string | null
          possui_repasse_touro?: boolean
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finalizar_lote: {
        Args: {
          p_data_envio: string
          p_frigorifico?: string
          p_lote_id: string
          p_media_arrobas_frigorifico?: number
          p_peso_total_informado?: number
          p_valor_recebido?: number
        }
        Returns: {
          atualizado_em: string
          criado_em: string
          data_envio: string | null
          data_inicio_confinamento: string
          frigorifico: string | null
          id: string
          media_arrobas_frigorifico: number | null
          nome: string
          observacoes: string | null
          peso_total_informado: number | null
          status: string
          valor_recebido: number | null
        }
        SetofOptions: {
          from: "*"
          to: "lotes_frigorifico"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_diagnostico: {
        Args: {
          p_data: string
          p_diagnostico: string
          p_participacao_id: string
        }
        Returns: {
          atualizado_em: string
          criado_em: string
          data_diagnostico: string | null
          diagnostico_prenhez: string
          etapa1_concluida: boolean
          etapa1_data: string | null
          etapa2_concluida: boolean
          etapa2_data: string | null
          etapa3_concluida: boolean
          etapa3_data: string | null
          id: string
          matriz_id: string
          observacoes: string | null
          protocolo_id: string
        }
        SetofOptions: {
          from: "*"
          to: "protocolo_matrizes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_parto: {
        Args: {
          p_data_parto: string
          p_matriz_id: string
          p_observacoes?: string
          p_raca_bezerro: string
          p_sexo_bezerro: string
        }
        Returns: {
          atualizado_em: string
          criado_em: string
          data_parto: string
          id: string
          matriz_id: string
          observacoes: string | null
          raca_bezerro: string
          sexo_bezerro: string
        }
        SetofOptions: {
          from: "*"
          to: "partos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
