import axios from "axios";

const MIDTRANS_API = "https://app.sandbox.midtrans.com/api"; // Change to production for live

interface MidtransPaymentParams {
  transactionId: string;
  amount: number;
  paymentMethod: "qris" | "bank_transfer" | "gopay" | "ovo" | "dana" | "shopeepay";
  customerName: string;
  customerEmail: string;
  callbackUrl: string;
}

export async function createMidtransPayment(params: MidtransPaymentParams) {
  const { transactionId, amount, paymentMethod, customerName, customerEmail, callbackUrl } = params;

  try {
    const response = await axios.post(`${MIDTRANS_API}/v1/charge`, {
      payment_type: getPaymentType(paymentMethod),
      transaction_details: {
        order_id: transactionId,
        gross_amount: Math.round(amount),
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
      ...getPaymentMethodDetails(paymentMethod),
      custom_expiry: {
        expiry_duration: 15,
        unit: "minute",
      },
    },
    {
      auth: {
        username: process.env.MIDTRANS_SERVER_KEY || "",
        password: "",
      },
    });

    return {
      success: true,
      transactionId: response.data.transaction_id,
      paymentData: response.data,
    };
  } catch (error) {
    console.error("Midtrans payment error:", error);
    throw error;
  }
}

function getPaymentType(method: string): string {
  const mapping: Record<string, string> = {
    qris: "qris",
    bank_transfer: "bank_transfer",
    gopay: "gopay",
    ovo: "ovo",
    dana: "dana",
    shopeepay: "shopeepay",
  };
  return mapping[method] || "gopay";
}

function getPaymentMethodDetails(method: string): Record<string, any> {
  const mapping: Record<string, Record<string, any>> = {
    qris: {
      qris: {
        acquirer: "gopay",
      },
    },
    bank_transfer: {
      bank_transfer: {
        bank: "bca",
      },
    },
    gopay: {
      gopay: {
        enable_callback: true,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      },
    },
    ovo: {},
    dana: {},
    shopeepay: {},
  };
  return mapping[method] || {};
}

export async function checkMidtransStatus(transactionId: string) {
  try {
    const response = await axios.get(
      `${MIDTRANS_API}/v2/${transactionId}/status`,
      {
        auth: {
          username: process.env.MIDTRANS_SERVER_KEY || "",
          password: "",
        },
      }
    );

    return {
      status: response.data.transaction_status,
      orderId: response.data.order_id,
      paymentData: response.data,
    };
  } catch (error) {
    console.error("Midtrans check status error:", error);
    throw error;
  }
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: number,
  serverKey: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto");
  const data = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(data).digest("hex");
  return hash === signatureKey;
}
