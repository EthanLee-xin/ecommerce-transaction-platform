"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import notify from "@/utils/notify";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";

import Message from "@/components/Message";
import Loader from "@/components/Loader";
import { useCreateOrderMutation } from "@/slices/ordersApiSlice";
import { clearCartItems } from "@/slices/cartSlice";
import { normalizeImageSrc } from "@/utils/imageUtils";

const PlaceOrderScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      router.replace("/shipping");
    } else if (!cart.paymentMethod) {
      router.replace("/payment");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, router]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      dispatch(clearCartItems());
      router.push(`/order/${res._id}`);
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Review
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Place Order
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="ui-card p-5">
            <h2 className="text-xl font-bold text-slate-950">Shipping</h2>
            <p className="mt-3 text-slate-700">
              <strong>Address:</strong> {cart.shippingAddress.address},{" "}
              {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
              {cart.shippingAddress.country}
            </p>
          </div>

          <div className='ui-card p-5'>
            <h2 className='text-xl font-bold text-slate-950'>
              Payment Method
            </h2>
            <p className='mt-3 text-slate-700'>
              <strong>Method:</strong> {cart.paymentMethod}
            </p>
          </div>

          <div className='ui-card p-5'>
            <h2 className='text-xl font-bold text-slate-950'>Order Items</h2>

            {cart.cartItems.length === 0 ? (
              <div className='mt-4'>
                <Message>Your cart is empty</Message>
              </div>
            ) : (
              <div className='mt-4 space-y-3'>
                {cart.cartItems.map((item) => (
                  <div
                    key={item._id}
                    className='grid gap-4 border-t border-slate-100 pt-3 sm:grid-cols-[64px_minmax(0,1fr)_160px] sm:items-center'
                  >
                    <Link
                      href={`/product/${item._id}`}
                      className='order-item-image rounded-xl bg-slate-100'
                    >
                      <Image
                        src={normalizeImageSrc(item.image)}
                        alt={item.name}
                        fill
                        sizes='64px'
                        className='object-contain p-2'
                      />
                    </Link>

                    <Link
                      href={`/product/${item._id}`}
                      className='font-medium text-slate-950 hover:text-indigo-600'
                    >
                      {item.name}
                    </Link>

                    <p className='text-sm font-semibold text-slate-700'>
                      {item.qty} x {item.price} = 
                      {(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className='lg:sticky lg:top-24 lg:self-start'>
          <div className='ui-card p-5'>
            <h2 className='text-xl font-bold text-slate-950'>
              Order Summary
            </h2>

            <div className='mt-5 space-y-3 border-t border-slate-200 pt-5'>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-500'>Items</span>
                <span className='font-medium'>${cart.itemsPrice}</span>
              </div>

              <div className='flex justify-between text-sm'>
                <span className='text-slate-500'>Shipping</span>
                <span className='font-medium'>${cart.shippingPrice}</span>
              </div>

              <div className='flex justify-between text-sm'>
                <span className='text-slate-500'>Tax</span>
                <span className='font-medium'>${cart.taxPrice}</span>
              </div>

              <div className='flex justify-between border-t border-slate-200 pt-3 text-base font-bold'>
                <span>Total</span>
                <span>${cart.totalPrice}</span>
              </div>
            </div>

            {error && (
              <div className='mt-4'>
                <Message variant='danger'>
                  {error?.data?.message || error.error}
                </Message>
              </div>
            )}

            <button
              type='button'
              disabled={cart.cartItems.length === 0 || isLoading}
              onClick={placeOrderHandler}
              className='ui-button ui-button-primary mt-6 w-full'
            >
              Place Order
            </button>

            {isLoading && <Loader />}
          </div>
        </aside>
      </div>
    </>
  );
};

export default PlaceOrderScreen;
