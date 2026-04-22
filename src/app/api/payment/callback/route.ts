import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyMidtransSignature } from "@/lib/payment/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status_code, gross_amount, signature_key } = body;

    // Verify Midtrans signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY || "",
      signature_key
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Map status code to payment status
    const statusMap: Record<string, string> = {
      "200": "completed",
      "201": "pending",
      "202": "pending",
      "407": "pending",
      "408": "pending",
      "409": "failed",
      "410": "cancelled",
    };

    const paymentStatus = statusMap[status_code] || "failed";

    // Update transaction payment status
    const { error } = await supabase
      .from("transactions")
      .update({ payment_status: paymentStatus })
      .eq("id", order_id);

    if (error) {
      console.error("Error updating transaction:", error);
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    // Log payment transaction
    await supabase.from("payment_transactions").insert([
      {
        transaction_id: order_id,
        payment_method: "qris",
        amount: gross_amount,
        reference_id: body.transaction_id,
        status: paymentStatus,
        response_data: body,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
