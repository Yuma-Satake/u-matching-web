export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      photos: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          img_url: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          img_url?: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          img_url?: string;
        };
        Relationships: [];
      };
      profile_photos: {
        Row: {
          created_at: string;
          id: string;
          img_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          img_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          img_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profile_photos_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profile_photos_img_id_fkey';
            columns: ['img_id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          alcohol: string | null;
          blood_type: string | null;
          cigarettes: string | null;
          created_at: string;
          encounter: string | null;
          id: string;
          instagram: string | null;
          introduction: string | null;
          personal_types: string | null;
          school: string | null;
          twitter: string | null;
        };
        Insert: {
          address?: string | null;
          alcohol?: string | null;
          blood_type?: string | null;
          cigarettes?: string | null;
          created_at?: string;
          encounter?: string | null;
          id?: string;
          instagram?: string | null;
          introduction?: string | null;
          personal_types?: string | null;
          school?: string | null;
          twitter?: string | null;
        };
        Update: {
          address?: string | null;
          alcohol?: string | null;
          blood_type?: string | null;
          cigarettes?: string | null;
          created_at?: string;
          encounter?: string | null;
          id?: string;
          instagram?: string | null;
          introduction?: string | null;
          personal_types?: string | null;
          school?: string | null;
          twitter?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          icon_img_id: string;
          id: string;
          is_male: boolean;
          mail: string | null;
          name_line: string;
          nickname: string | null;
        };
        Insert: {
          created_at?: string;
          icon_img_id?: string;
          id?: string;
          is_male?: boolean;
          mail?: string | null;
          name_line?: string;
          nickname?: string | null;
        };
        Update: {
          created_at?: string;
          icon_img_id?: string;
          id?: string;
          is_male?: boolean;
          mail?: string | null;
          name_line?: string;
          nickname?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_icon_img_id_fkey';
            columns: ['icon_img_id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
