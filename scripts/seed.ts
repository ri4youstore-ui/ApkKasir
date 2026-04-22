import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_PRODUCTS = [
  {
    name: "Kopi Hitam",
    description: "Kopi hitam tanpa gula",
    sku: "KOF-001",
    price: 12000,
    cost: 5000,
    stock: 50,
    category: "Minuman",
  },
  {
    name: "Kopi Susu",
    description: "Kopi dengan susu kental",
    sku: "KOF-002",
    price: 15000,
    cost: 6000,
    stock: 40,
    category: "Minuman",
  },
  {
    name: "Teh Dingin",
    description: "Teh dingin segar",
    sku: "TEH-001",
    price: 10000,
    cost: 3000,
    stock: 60,
    category: "Minuman",
  },
  {
    name: "Jus Jeruk",
    description: "Jus jeruk segar",
    sku: "JUS-001",
    price: 20000,
    cost: 8000,
    stock: 30,
    category: "Minuman",
  },
  {
    name: "Martabak Manis",
    description: "Martabak dengan berbagai topping",
    sku: "MAK-001",
    price: 25000,
    cost: 10000,
    stock: 25,
    category: "Makanan",
  },
  {
    name: "Roti Bakar",
    description: "Roti bakar dengan margarin",
    sku: "RTB-001",
    price: 15000,
    cost: 5000,
    stock: 35,
    category: "Makanan",
  },
  {
    name: "Donat Coklat",
    description: "Donat dengan selai coklat",
    sku: "DNT-001",
    price: 8000,
    cost: 2000,
    stock: 80,
    category: "Makanan",
  },
  {
    name: "Bakso Sapi",
    description: "Bakso sapi berkuah",
    sku: "BKS-001",
    price: 20000,
    cost: 8000,
    stock: 20,
    category: "Makanan",
  },
  {
    name: "Mie Ayam",
    description: "Mie ayam dengan kuah sedap",
    sku: "MIA-001",
    price: 18000,
    cost: 7000,
    stock: 25,
    category: "Makanan",
  },
  {
    name: "Nasi Goreng",
    description: "Nasi goreng istimewa",
    sku: "NGR-001",
    price: 22000,
    cost: 9000,
    stock: 15,
    category: "Makanan",
  },
];

async function seed() {
  try {
    console.log("🌱 Starting seed process...");

    // 1. Create owner account
    const ownerEmail = "owner@kasir.test";
    const ownerPassword = "password123";

    console.log("📧 Creating owner account...");
    const { data: ownerAuthData, error: ownerAuthError } =
      await supabase.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        email_confirm: true,
        user_metadata: {
          full_name: "Budi Santoso",
        },
      });

    if (ownerAuthError) {
      console.error("❌ Error creating owner:", ownerAuthError.message);
      return;
    }

    const ownerId = ownerAuthData.user.id;
    console.log("✅ Owner account created:", ownerId);

    // 2. Create store
    console.log("🏪 Creating store...");
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .insert([
        {
          name: "Kafe Santai",
          owner_id: ownerId,
          address: "Jl. Merdeka No. 123, Jakarta",
          phone: "021-123456",
          receipt_footer: "Terima kasih telah berbelanja!\nKunjungi lagi ya!",
          theme: "light",
        },
      ])
      .select()
      .single();

    if (storeError) {
      console.error("❌ Error creating store:", storeError.message);
      return;
    }

    const storeId = storeData.id;
    console.log("✅ Store created:", storeId);

    // 3. Create owner user profile
    console.log("👤 Creating owner profile...");
    await supabase.from("users").insert([
      {
        id: ownerId,
        store_id: storeId,
        role: "owner",
        name: "Budi Santoso",
        email: ownerEmail,
      },
    ]);

    console.log("✅ Owner profile created");

    // 4. Create cashier accounts
    console.log("👨‍💼 Creating cashier accounts...");

    const cashiers = [
      {
        email: "cashier1@kasir.test",
        name: "Rani Wijaya",
      },
      {
        email: "cashier2@kasir.test",
        name: "Toni Hidayat",
      },
    ];

    for (const cashier of cashiers) {
      const { data: cashierAuthData, error: cashierAuthError } =
        await supabase.auth.admin.createUser({
          email: cashier.email,
          password: "password123",
          email_confirm: true,
          user_metadata: {
            full_name: cashier.name,
          },
        });

      if (!cashierAuthError && cashierAuthData) {
        await supabase.from("users").insert([
          {
            id: cashierAuthData.user.id,
            store_id: storeId,
            role: "cashier",
            name: cashier.name,
            email: cashier.email,
          },
        ]);

        console.log(`✅ Cashier created: ${cashier.name}`);
      }
    }

    // 5. Create products
    console.log("📦 Creating products...");
    const productInserts = DEMO_PRODUCTS.map((p) => ({
      ...p,
      store_id: storeId,
    }));

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .insert(productInserts);

    if (productsError) {
      console.error("❌ Error creating products:", productsError.message);
      return;
    }

    console.log(`✅ ${DEMO_PRODUCTS.length} products created`);

    // 6. Create sample transactions
    console.log("💰 Creating sample transactions...");

    // Get first cashier
    const { data: cashierUsers } = await supabase
      .from("users")
      .select("id")
      .eq("store_id", storeId)
      .eq("role", "cashier")
      .limit(1);

    if (cashierUsers && cashierUsers.length > 0) {
      const cashierId = cashierUsers[0].id;

      // Get some products
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", storeId)
        .limit(5);

      if (products && products.length > 0) {
        // Create 3 sample transactions
        for (let i = 0; i < 3; i++) {
          const { data: transactionData, error: transError } = await supabase
            .from("transactions")
            .insert([
              {
                store_id: storeId,
                cashier_id: cashierId,
                total_amount: 50000 + Math.random() * 50000,
                total_paid: 100000,
                change_amount: 50000 - Math.random() * 50000,
                payment_method: ["cash", "qris", "gopay"][
                  Math.floor(Math.random() * 3)
                ],
                payment_status: "completed",
              },
            ])
            .select()
            .single();

          if (!transError && transactionData) {
            // Create transaction items
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const transactionItems = [];

            for (let j = 0; j < itemCount; j++) {
              const product =
                products[Math.floor(Math.random() * products.length)];
              const quantity = Math.floor(Math.random() * 3) + 1;

              transactionItems.push({
                transaction_id: transactionData.id,
                product_id: product.id,
                quantity,
                unit_price: 25000,
                subtotal: 25000 * quantity,
              });
            }

            await supabase
              .from("transaction_items")
              .insert(transactionItems);

            console.log(`✅ Transaction ${i + 1} created with items`);
          }
        }
      }
    }

    console.log("\n✨ 🌱 Seeding completed successfully!");
    console.log("\n📱 Demo Credentials:");
    console.log(`Email: ${ownerEmail}`);
    console.log(`Password: ${ownerPassword}`);
    console.log("\n📱 Demo Cashier Credentials:");
    console.log(`Email: cashier1@kasir.test`);
    console.log(`Password: password123`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
