-- ApkKasir Database Schema for Supabase

-- 1. Stores Table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address text,
  phone text,
  logo_url text,
  receipt_footer text,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(owner_id)
);

-- 2. Users Table (Employee/Kasir)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'cashier')),
  name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(email),
  UNIQUE(id, store_id)
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sku text NOT NULL,
  price numeric(12, 2) NOT NULL CHECK (price > 0),
  cost numeric(12, 2) NOT NULL CHECK (cost >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  category text DEFAULT 'Umum',
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(store_id, sku)
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cashier_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount numeric(12, 2) NOT NULL,
  total_paid numeric(12, 2) NOT NULL,
  change_amount numeric(12, 2) DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'qris', 'dana', 'ovo', 'gopay', 'shopeepay', 'bank_transfer')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Transaction Items Table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12, 2) NOT NULL,
  subtotal numeric(12, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Payment Transactions Table (for payment gateway)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  payment_method text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  reference_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  response_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_transactions_store_id ON transactions(store_id);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);
CREATE INDEX idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

-- Enable RLS (Row Level Security)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Stores
CREATE POLICY "Users can view their own store" ON stores
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own store" ON stores
  FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for Users
CREATE POLICY "Users can view own profile and store colleagues" ON users
  FOR SELECT USING (
    auth.uid() = id OR
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

-- RLS Policies for Products
CREATE POLICY "Store staff can view active products" ON products
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()) OR
    store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only owners can manage products" ON products
  FOR INSERT USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Only owners can update products" ON products
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

-- RLS Policies for Transactions
CREATE POLICY "Users can view store transactions" ON transactions
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()) OR
    cashier_id = auth.uid()
  );

CREATE POLICY "Cashiers can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for Transaction Items
CREATE POLICY "Users can view transaction items" ON transaction_items
  FOR SELECT USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
         OR cashier_id = auth.uid()
    )
  );

-- Trigger to sync users table with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- This would be called from a custom function
  -- to create user profile when signing up
  RETURN NEW;
END;
$$;

-- Function to decrease product stock
CREATE OR REPLACE FUNCTION decrease_stock(product_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id AND stock >= quantity;
END;
$$;

-- Function to get top products
CREATE OR REPLACE FUNCTION get_top_products(store_id_param uuid, limit_param integer)
RETURNS TABLE (id uuid, name text, total_sold integer)
LANGUAGE sql
AS $$
  SELECT p.id, p.name, SUM(ti.quantity)::integer as total_sold
  FROM products p
  LEFT JOIN transaction_items ti ON p.id = ti.product_id
  LEFT JOIN transactions t ON ti.transaction_id = t.id
  WHERE p.store_id = store_id_param
  GROUP BY p.id, p.name
  ORDER BY total_sold DESC NULLS LAST
  LIMIT limit_param;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
