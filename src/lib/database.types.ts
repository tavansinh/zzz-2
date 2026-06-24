// fallow-ignore-file unused-type
// fallow-ignore-file unused-export
// fallow-ignore-file code-duplication
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          package_id: string | null;
          password: string;
          service_id: string | null;
          status: string;
          updated_at: string;
          used_at: string | null;
          used_order: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          package_id?: string | null;
          password: string;
          service_id?: string | null;
          status?: string;
          updated_at?: string;
          used_at?: string | null;
          used_order?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          package_id?: string | null;
          password?: string;
          service_id?: string | null;
          status?: string;
          updated_at?: string;
          used_at?: string | null;
          used_order?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_package_id_fkey';
            columns: ['package_id'];
            isOneToOne: false;
            referencedRelation: 'packages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_used_order_fkey';
            columns: ['used_order'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_users: {
        Row: {
          created_at: string;
          created_by: string | null;
          email: string;
          id: string;
          is_active: boolean;
          is_protected: boolean;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          email: string;
          id: string;
          is_active?: boolean;
          is_protected?: boolean;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          email?: string;
          id?: string;
          is_active?: boolean;
          is_protected?: boolean;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          account_id: string | null;
          amount: number;
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          customer_email: string | null;
          delivery_type: string;
          id: string;
          package_id: string | null;
          package_name: string;
          paid_at: string | null;
          status: string;
          zalo_phone: string | null;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          customer_email?: string | null;
          delivery_type?: string;
          id?: string;
          package_id?: string | null;
          package_name: string;
          paid_at?: string | null;
          status?: string;
          zalo_phone?: string | null;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          customer_email?: string | null;
          delivery_type?: string;
          id?: string;
          package_id?: string | null;
          package_name?: string;
          paid_at?: string | null;
          status?: string;
          zalo_phone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_package_id_fkey';
            columns: ['package_id'];
            isOneToOne: false;
            referencedRelation: 'packages';
            referencedColumns: ['id'];
          },
        ];
      };
      packages: {
        Row: {
          badge: string | null;
          created_at: string;
          description: string | null;
          duration_days: number;
          features: string[];
          id: string;
          is_active: boolean;
          name: string;
          price: number;
          service_id: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          badge?: string | null;
          created_at?: string;
          description?: string | null;
          duration_days: number;
          features?: string[];
          id?: string;
          is_active?: boolean;
          name: string;
          price: number;
          service_id?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          badge?: string | null;
          created_at?: string;
          description?: string | null;
          duration_days?: number;
          features?: string[];
          id?: string;
          is_active?: boolean;
          name?: string;
          price?: number;
          service_id?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'packages_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };
      services: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          account_name: string;
          account_no: string;
          bank_id: string;
          id: boolean;
          template: string;
        };
        Insert: {
          account_name: string;
          account_no: string;
          bank_id: string;
          id?: boolean;
          template?: string;
        };
        Update: {
          account_name?: string;
          account_no?: string;
          bank_id?: string;
          id?: boolean;
          template?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_existing_staff: {
        Args: {
          staff_email: string;
        };
        Returns: Database['public']['Tables']['admin_users']['Row'];
      };
      count_available_by_package: {
        Args: Record<PropertyKey, never>;
        Returns: {
          available_count: number;
          package_id: string;
        }[];
      };
      create_public_order: {
        Args: {
          p_customer_email: string | null;
          p_delivery_type?: string;
          p_package_id: string;
          p_zalo_phone?: string | null;
        };
        Returns: Database['public']['Tables']['orders']['Row'];
      };
      get_public_order: {
        Args: {
          p_order_id: string;
        };
        Returns: Database['public']['Tables']['orders']['Row'];
      };
      import_accounts: {
        Args: {
          p_content: string;
          p_package_id: string;
          p_service_id: string;
        };
        Returns: {
          email: string | null;
          line_number: number;
          ok: boolean;
          reason: string | null;
        }[];
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

export { Constants };
