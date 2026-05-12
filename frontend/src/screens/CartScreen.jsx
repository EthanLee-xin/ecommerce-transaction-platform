"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import notify from "@/utils/notify";

import Message from "@/components/Message";
import { addToCart, removeFromCart, clearCartItems } from "@/slices/cartSlice";
import { useCreateDraftOrderMutation } from "@/slices/ordersApiSlice";
import { normalizeImageSrc } from "@/utils/imageUtils";

const CartScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const { userInfo } = useSelector((state) => state.auth);

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const [createDraftOrder, { isLoading: loadingCreateDraftOrder }] =
    useCreateDraftOrderMutation();

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = async () => {
    if (!userInfo) {
      router.push("/login?redirect=/cart");
      return;
    }

    try {
      const res = await createDraftOrder({
        orderItems: cart.cartItems,
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

  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const subtotal = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Your basket
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Shopping Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <Message>
            Your cart is empty <Link href="/">Go Back</Link>
          </Message>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <article key={item._id} className="ui-card p-4">
                <div className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)_120px_120px_44px] sm:items-center">
                  <Link
                    href={`/product/${item._id}`}
                    className="cart-item-image rounded-xl bg-slate-100"
                  >
                    <Image
                      src={normalizeImageSrc(item.image)}
                      alt={item.name}
                      fill
                      sizes="88px"
                      className="object-contain p-2"
                    />
                  </Link>

                  <div>
                    <Link
                      href={`/product/${item._id}`}
                      className="font-semibold text-slate-950 hover:text-indigo-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      Stock: {item.countInStock}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-950">${item.price}</p>

                  <select
                    value={item.qty}
                    onChange={(e) =>
                      addToCartHandler(item, Number(e.target.value))
                    }
                    className="ui-input"
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => removeFromCartHandler(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="ui-card p-5">
          <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>

          <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Items</span>
              <span className="font-medium text-slate-950">{itemCount}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-950">${subtotal}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={cartItems.length === 0 || loadingCreateDraftOrder}
            onClick={checkoutHandler}
            className="ui-button ui-button-primary mt-6 w-full"
          >
            {loadingCreateDraftOrder
              ? "Creating Order..."
              : "Proceed To Checkout"}
          </button>

          {/* <Link href="/" className="ui-button ui-button-secondary mt-3 w-full">
            Continue Shopping
          </Link> */}
        </div>
      </aside>
    </div>
  );
};

export default CartScreen;
