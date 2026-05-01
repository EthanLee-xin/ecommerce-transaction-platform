import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { getFriendlyErrorMessage } from '../utils/errorCodeMessages';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
  useRefundOrderMutation,
} from '../slices/ordersApiSlice';
import type { OrderDetails } from '../types';

type RootState = {
  auth: {
    userInfo?: { isAdmin?: boolean };
  };
};

type PayPalData = Record<string, unknown>;

type OrderStatusHistoryItem = NonNullable<OrderDetails['statusHistory']>[number];

const OrderScreen = () => {
  const { id: orderId } = useParams<{ id: string }>();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId as string);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const [refundOrder, { isLoading: loadingRefund }] = useRefundOrderMutation();

  const { userInfo } = useSelector((state: RootState) => state.auth);
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal?.clientId) {
      paypalDispatch({
        type: 'resetOptions',
        value: {
          'client-id': paypal.clientId,
          currency: 'USD',
        },
      });
    }
  }, [errorPayPal, loadingPayPal, paypal, paypalDispatch]);

  async function onApprove(data: PayPalData, actions: { order?: { capture: () => Promise<unknown> } }) {
    if (!actions.order) return;

    return actions.order.capture().then(async function (details: unknown) {
      try {
        await payOrder({ orderId: orderId!, details }).unwrap();
        refetch();
        toast.success('Order is paid');
      } catch (err: unknown) {
        toast.error(getFriendlyErrorMessage(err as never));
      }
    });
  }

  function onError(err: { message?: string }) {
    toast.error(err.message || 'PayPal payment failed');
  }

  function createOrder(data: PayPalData, actions: { order?: { create: (input: { purchase_units: Array<{ amount: { value: string } }> }) => Promise<string> } }) {
    if (!actions.order) return Promise.reject(new Error('PayPal actions are unavailable'));

    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: String(order?.totalPrice || '0.00') },
          },
        ],
      })
      .then((orderID: string) => orderID);
  }

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId as string).unwrap();
      refetch();
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err as never));
    }
  };

  const refundHandler = async () => {
    try {
      await refundOrder(orderId as string).unwrap();
      refetch();
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err as never));
    }
  };

  const renderStatusTimeline = () => {
    const history = order?.statusHistory || [];

    if (history.length === 0) {
      return <Message>No status changes yet.</Message>;
    }

    return (
      <div className='position-relative ps-4'>
        <div
          className='position-absolute top-0 bottom-0'
          style={{
            left: '14px',
            width: '2px',
            background: '#dee2e6',
          }}
        />
        {history.map((item: OrderStatusHistoryItem, index: number) => {
          const isLatest = index === history.length - 1;
          return (
            <div
              key={`${item.status}-${item.changedAt}-${index}`}
              className='mb-4 position-relative'
            >
              <div
                className='position-absolute rounded-circle'
                style={{
                  left: '-24px',
                  top: '6px',
                  width: '14px',
                  height: '14px',
                  background: isLatest ? '#0d6efd' : '#6c757d',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 1px #dee2e6',
                }}
              />
              <Card className={isLatest ? 'border-primary shadow-sm' : 'border-0 bg-light'}>
                <Card.Body className='py-2'>
                  <div className='d-flex justify-content-between align-items-start gap-3'>
                    <div>
                      <div className='fw-bold text-uppercase small text-muted'>
                        {item.status}
                      </div>
                      {item.note ? <div>{item.note}</div> : null}
                    </div>
                    <small className='text-muted text-nowrap'>
                      {item.changedAt ? new Date(item.changedAt).toLocaleString() : ''}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{getFriendlyErrorMessage(error as never)}</Message>
  ) : order ? (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              <p>
                <strong>Fulfillment: </strong>
                {order.fulfillmentStatus}
              </p>
              <p>
                <strong>Inventory: </strong>
                {order.inventoryStatus}
              </p>
              <p>
                <strong>Refund: </strong>
                {order.refundStatus}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>Delivered on {order.deliveredAt}</Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index: number) => (
                    <ListGroup.Item key={`${item.name}-${index}`}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>{item.name}</Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Status Timeline</h2>
              {renderStatusTimeline()}
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
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {isPending ? (
                    <Loader />
                  ) : (
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                    />
                  )}
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {loadingRefund && <Loader />}
              {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button type='button' className='btn btn-block' onClick={deliverHandler}>
                    Mark As Delivered
                  </Button>
                </ListGroup.Item>
              )}
              {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type='button'
                    className='btn btn-outline-danger btn-block'
                    onClick={refundHandler}
                  >
                    Refund Order
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  ) : null;
};

export default OrderScreen;
