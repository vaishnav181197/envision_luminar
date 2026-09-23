export type UserRole = "student" | "admin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          display_name: string | null;
          batch: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          display_name?: string | null;
          batch?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          display_name?: string | null;
          batch?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      eligible_students: {
        Row: {
          id: string;
          email: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      otp_challenges: {
        Row: {
          id: string;
          email: string;
          code_hash: string;
          expires_at: string;
          attempts: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          code_hash: string;
          expires_at: string;
          attempts?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          code_hash?: string;
          expires_at?: string;
          attempts?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string;
          demo_url: string;
          thumbnail_url: string | null;
          author_name: string | null;
          batch: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          description: string;
          demo_url: string;
          thumbnail_url?: string | null;
          author_name?: string | null;
          batch?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string;
          demo_url?: string;
          thumbnail_url?: string | null;
          author_name?: string | null;
          batch?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          eligible_student_id: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          eligible_student_id: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          eligible_student_id?: string;
          project_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          voting_end_time: string;
        };
        Insert: {
          id?: number;
          voting_end_time: string;
        };
        Update: {
          id?: number;
          voting_end_time?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cast_vote: {
        Args: {
          p_project_id: string;
          p_eligible_student_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
