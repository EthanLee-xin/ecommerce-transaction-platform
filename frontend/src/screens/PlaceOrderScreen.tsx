import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Row, Col, ListGroup, Image, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import {
  useCreateOrderMutation,
  useCreateStripePaymentIntentMutation,
  useConfirmStripePaymentMutation,
  useGetStripeConfigQuery,
} from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';
import type { CreateOrderRequest } from '../types/order';

type CartItem = {
  image: string;
  name: string;
  product?: string;
  qty: number;
  price: number;
};

type CartState = {
  cartItems: CartItem[];
  shippingAddress: {
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};

type RootState = {
  cart: CartState;
};

type StripePaymentIntent = {
  id: string;
  status: string;
};

type StripeConfirmError = {
  data?: { message?: string };
  error?: string;
};

const StripeCheckoutForm = ({ orderId }: { orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);
  const [stripeMessage, setStripeMessage] = useState('');
  const [confirmStripePayment] = useConfirmStripePaymentMutation();

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setStripeMessage('');

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setStripeMessage(result.error.message || 'Stripe payment failed');
      toast.error(result.error.message || 'Stripe payment failed');
      setProcessing(false);
      return;
    }

    const paymentIntent = result.paymentIntent as StripePaymentIntent | null;
    if (paymentIntent) {
      try {
        await confirmStripePayment({
          orderId,
          paymentIntentId: paymentIntent.id,
          paymentStatus: paymentIntent.status,
        }).unwrap();
        dispatch(clearCartItems());
        toast.success('Stripe payment completed');
        navigate(`/order/${orderId}`);
      } catch (err: unknown) {
        const typedErr = err as StripeConfirmError;
        const message = typedErr?.data?.message || typedErr.error || 'Stripe confirmation failed';
        setStripeMessage(message);
        toast.error(message);
      }
    }

    setProcessing(false);
  };

  return (
    <Form onSubmit={submitHandler}>
      <PaymentElement />
      {stripeMessage ? <Message variant='danger'>{stripeMessage}</Message> : null}
      <Button
        type='submit'
        className='btn-block mt-3'
        disabled={!stripe || !elements || processing}
      >
        {processing ? 'Processing...' : 'Pay with Stripe'}
      </Button>
    </Form>
  );
};

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart);
  const [stripeError, setStripeError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState<Awaited<ReturnType<typeof loadStripe>> | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState('');

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [createStripePaymentIntent] = useCreateStripePaymentIntentMutation();
  const { data: stripeConfig } = useGetStripeConfigQuery();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  useEffect(() => {
    if (stripeConfig?.publishableKey) {
      void loadStripe(stripeConfig.publishableKey).then((stripe) => {
        setStripePromise(stripe);
      });
    }
  }, [stripeConfig?.publishableKey]);

  const dispatch = useDispatch();

  const placeOrderHandler = async () => {
    try {
      const orderRequest: CreateOrderRequest = {
        orderItems: cart.cartItems,
        shippingAddress: {
          address: cart.shippingAddress.address || '',
          city: cart.shippingAddress.city || '',
          postalCode: cart.shippingAddress.postalCode || '',
          country: cart.shippingAddress.country || '',
        },
        paymentMethod: cart.paymentMethod,
        paymentProvider: cart.paymentMethod === 'Stripe' ? 'stripe' : 'paypal',
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      };

      const res = await createOrder(orderRequest).unwrap();

      if (cart.paymentMethod === 'Stripe') {
        const intent = await createStripePaymentIntent({ orderId: res._id }).unwrap();
        setPendingOrderId(res._id);
        setClientSecret(intent.clientSecret);
      } else {
        dispatch(clearCartItems());
        navigate(`/order/${res._id}`);
      }
    } catch (err: unknown) {
      const typedErr = err as StripeConfirmError;
      const message = typedErr?.data?.message || typedErr.error || 'Order creation failed';
      setStripeError(message);
      toast.error(message);
    }
  };

  const stripeOptions = useMemo<StripeElementsOptions | null>(() => {
    if (!clientSecret) return null;
    return { clientSecret };
  }, [clientSecret]);

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address:</strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode},{' '}
                {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {cart.paymentMethod}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={`${item.name}-${index}`}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${cart.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error || stripeError ? (
                  <Message variant='danger'>
                    {(error as { data?: { message?: string }; error?: string })?.data?.message ||
                      (error as { data?: { message?: string }; error?: string })?.error ||
                      stripeError}
                  </Message>
                ) : null}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='btn-block'
                  disabled={cart.cartItems.length === 0 || isLoading}
                  onClick={placeOrderHandler}
                >
                  {cart.paymentMethod === 'Stripe' ? 'Create Stripe Payment' : 'Place Order'}
                </Button>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {cart.paymentMethod === 'Stripe' && clientSecret && stripePromise && stripeOptions ? (
            <Card className='mt-3'>
              <Card.Body>
                <h2>Stripe Payment</h2>
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <StripeCheckoutForm orderId={pendingOrderId} />
                </Elements>
              </Card.Body>
            </Card>
          ) : null}
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
