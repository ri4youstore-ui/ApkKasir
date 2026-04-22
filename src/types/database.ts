export type User = {
  id: string;
  email: string;
  role: "owner" | "cashier";
  store_id: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Store = {
  id: string;
  name: string;
  owner_id: string;
  address: string;
  phone?: string;
  logo_url?: string;
  receipt_footer?: string;
  theme: "light" | "dark";
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  store_id: string;
  cashier_id: string;
  total_amount: number;
  total_paid: number;
  change_amount: number;
  payment_method: "cash" | "qris" | "dana" | "ovo" | "gopay" | "shopeepay" | "bank_transfer";
  payment_status: "pending" | "completed" | "failed" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
};

export type PaymentTransaction = {
  id: string;
  transaction_id: string;
  payment_method: string;
  amount: number;
  reference_id?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  response_data: Record<string, any>;
  created_at: string;
  updated_at: string;
};
