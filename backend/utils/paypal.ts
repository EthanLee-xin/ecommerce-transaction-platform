import dotenv from 'dotenv';

dotenv.config();

const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET, PAYPAL_API_URL } = process.env;

type OrderModelLike = {
  find: (query: Record<string, unknown>) => Promise<Array<{ paymentResult?: { id?: string } }>>;
};

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString('base64');
  const url = `${PAYPAL_API_URL}/v1/oauth2/token`;

  const headers = {
    Accept: 'application/json',
    'Accept-Language': 'en_US',
    Authorization: `Basic ${auth}`,
  };

  const body = 'grant_type=client_credentials';
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) throw new Error('Failed to get access token');

  const paypalData = await response.json() as { access_token: string };

  return paypalData.access_token;
}

export async function checkIfNewTransaction(orderModel: OrderModelLike, paypalTransactionId: string) {
  try {
    const orders = await orderModel.find({
      'paymentResult.id': paypalTransactionId,
    });

    return orders.length === 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function verifyPayPalPayment(paypalTransactionId: string) {
  const accessToken = await getPayPalAccessToken();
  const paypalResponse = await fetch(
    `${PAYPAL_API_URL}/v2/checkout/orders/${paypalTransactionId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!paypalResponse.ok) throw new Error('Failed to verify payment');

  const paypalData = await paypalResponse.json() as {
    status: string;
    purchase_units: Array<{ amount: { value: string } }>;
  };
  return {
    verified: paypalData.status === 'COMPLETED',
    value: paypalData.purchase_units[0].amount.value,
  };
}
