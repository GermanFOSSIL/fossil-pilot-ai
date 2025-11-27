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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          content: string
          created_at: string | null
          id: string
          project_id: string
          subsystem_id: string | null
          system_id: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          project_id: string
          subsystem_id?: string | null
          system_id?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string
          subsystem_id?: string | null
          system_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_subsystem_id_fkey"
            columns: ["subsystem_id"]
            isOneToOne: false
            referencedRelation: "subsystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          created_at: string | null
          entity_type: string
          error_details: Json | null
          file_name: string | null
          id: string
          import_type: string
          metadata: Json | null
          project_id: string | null
          records_failed: number | null
          records_processed: number | null
          records_success: number | null
          status: string | null
          system_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          error_details?: Json | null
          file_name?: string | null
          id?: string
          import_type: string
          metadata?: Json | null
          project_id?: string | null
          records_failed?: number | null
          records_processed?: number | null
          records_success?: number | null
          status?: string | null
          system_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          error_details?: Json | null
          file_name?: string | null
          id?: string
          import_type?: string
          metadata?: Json | null
          project_id?: string | null
          records_failed?: number | null
          records_processed?: number | null
          records_success?: number | null
          status?: string | null
          system_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_logs_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      itrs: {
        Row: {
          comments: string | null
          created_at: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          id: string
          itr_code: string
          itr_type: Database["public"]["Enums"]["itr_type"]
          last_update: string | null
          status: Database["public"]["Enums"]["itr_status"] | null
          subsystem_id: string | null
          tag_id: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          id?: string
          itr_code: string
          itr_type: Database["public"]["Enums"]["itr_type"]
          last_update?: string | null
          status?: Database["public"]["Enums"]["itr_status"] | null
          subsystem_id?: string | null
          tag_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          discipline?: Database["public"]["Enums"]["discipline"]
          id?: string
          itr_code?: string
          itr_type?: Database["public"]["Enums"]["itr_type"]
          last_update?: string | null
          status?: Database["public"]["Enums"]["itr_status"] | null
          subsystem_id?: string | null
          tag_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itrs_subsystem_id_fkey"
            columns: ["subsystem_id"]
            isOneToOne: false
            referencedRelation: "subsystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itrs_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      preservation_tasks: {
        Row: {
          created_at: string | null
          description: string
          frequency_days: number
          id: string
          last_done_date: string | null
          next_due_date: string
          status: Database["public"]["Enums"]["preservation_status"] | null
          tag_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          frequency_days: number
          id?: string
          last_done_date?: string | null
          next_due_date: string
          status?: Database["public"]["Enums"]["preservation_status"] | null
          tag_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          frequency_days?: number
          id?: string
          last_done_date?: string | null
          next_due_date?: string
          status?: Database["public"]["Enums"]["preservation_status"] | null
          tag_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preservation_tasks_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      punch_items: {
        Row: {
          category: Database["public"]["Enums"]["punch_category"]
          closed_date: string | null
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          raised_by: string | null
          status: Database["public"]["Enums"]["punch_status"] | null
          subsystem_id: string
          tag_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["punch_category"]
          closed_date?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          raised_by?: string | null
          status?: Database["public"]["Enums"]["punch_status"] | null
          subsystem_id: string
          tag_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["punch_category"]
          closed_date?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          raised_by?: string | null
          status?: Database["public"]["Enums"]["punch_status"] | null
          subsystem_id?: string
          tag_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "punch_items_subsystem_id_fkey"
            columns: ["subsystem_id"]
            isOneToOne: false
            referencedRelation: "subsystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      subsystems: {
        Row: {
          actual_end_date: string | null
          actual_start_date: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          planned_end_date: string | null
          planned_start_date: string | null
          status: Database["public"]["Enums"]["system_status"] | null
          system_id: string
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          status?: Database["public"]["Enums"]["system_status"] | null
          system_id: string
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          status?: Database["public"]["Enums"]["system_status"] | null
          system_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsystems_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      systems: {
        Row: {
          code: string
          created_at: string | null
          criticality: Database["public"]["Enums"]["criticality"] | null
          description: string | null
          id: string
          name: string
          project_id: string
          status: Database["public"]["Enums"]["system_status"] | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          criticality?: Database["public"]["Enums"]["criticality"] | null
          description?: string | null
          id?: string
          name: string
          project_id: string
          status?: Database["public"]["Enums"]["system_status"] | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          criticality?: Database["public"]["Enums"]["criticality"] | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          status?: Database["public"]["Enums"]["system_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "systems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          criticality: Database["public"]["Enums"]["criticality"] | null
          description: string | null
          device_type: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          id: string
          subsystem_id: string
          tag_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criticality?: Database["public"]["Enums"]["criticality"] | null
          description?: string | null
          device_type?: string | null
          discipline: Database["public"]["Enums"]["discipline"]
          id?: string
          subsystem_id: string
          tag_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criticality?: Database["public"]["Enums"]["criticality"] | null
          description?: string | null
          device_type?: string | null
          discipline?: Database["public"]["Enums"]["discipline"]
          id?: string
          subsystem_id?: string
          tag_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_subsystem_id_fkey"
            columns: ["subsystem_id"]
            isOneToOne: false
            referencedRelation: "subsystems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      criticality: "LOW" | "MEDIUM" | "HIGH"
      discipline: "MECH" | "ELEC" | "INST" | "CIVIL" | "PIPE" | "OTHER"
      itr_status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED"
      itr_type: "A" | "B"
      preservation_status: "OK" | "OVERDUE"
      project_status: "PLANNING" | "EXECUTION" | "COMPLETIONS" | "CLOSED"
      punch_category: "A" | "B" | "C"
      punch_status: "OPEN" | "IN_PROGRESS" | "CLOSED"
      system_status:
        | "NOT_STARTED"
        | "IN_PROGRESS"
        | "READY_FOR_ENERGIZATION"
        | "ENERGIZED"
      user_role: "ADMIN" | "MANAGER" | "QAQC" | "PRECOM" | "VIEWER"
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
      criticality: ["LOW", "MEDIUM", "HIGH"],
      discipline: ["MECH", "ELEC", "INST", "CIVIL", "PIPE", "OTHER"],
      itr_status: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "REJECTED"],
      itr_type: ["A", "B"],
      preservation_status: ["OK", "OVERDUE"],
      project_status: ["PLANNING", "EXECUTION", "COMPLETIONS", "CLOSED"],
      punch_category: ["A", "B", "C"],
      punch_status: ["OPEN", "IN_PROGRESS", "CLOSED"],
      system_status: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "READY_FOR_ENERGIZATION",
        "ENERGIZED",
      ],
      user_role: ["ADMIN", "MANAGER", "QAQC", "PRECOM", "VIEWER"],
    },
  },
} as const
