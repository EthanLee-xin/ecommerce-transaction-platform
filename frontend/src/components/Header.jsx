"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import notify from "@/utils/notify";
import { useLogoutMutation } from "@/slices/usersApiSlice";
import { logout } from "@/slices/authSlice";
import { resetCart } from "@/slices/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import SearchBox from "./SearchBox";
import logo from "@/assets/logo.png";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      router.push("/login");
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));

    return () => window.cancelAnimationFrame(id);
  }, []);

  const cartItemsCount = cartItems.reduce((a, c) => a + c.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="app-container">
        <div className="flex min-h-16 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src={logo} alt="ProShop" width={40} height={40} priority />
            <span className="text-lg font-bold tracking-tight">Ethan</span>
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBox />
          </div>

          <nav className="ml-auto flex items-center gap-1 text-sm font-medium text-slate-700">
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100"
            >
              <FaShoppingCart />
              <span>Cart</span>

              {mounted && cartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {mounted && userInfo?.isAdmin && (
              <div className="hidden items-center gap-1 lg:flex">
                <Link
                  href="/admin/productlist"
                  className="rounded-xl px-3 py-2 hover:bg-slate-100"
                >
                  Products
                </Link>

                <Link
                  href="/admin/orderlist"
                  className="rounded-xl px-3 py-2 hover:bg-slate-100"
                >
                  Orders
                </Link>

                <Link
                  href="/admin/userlist"
                  className="rounded-xl px-3 py-2 hover:bg-slate-100"
                >
                  Users
                </Link>
              </div>
            )}

            <div className="min-w-24">
              {mounted ? (
                userInfo ? (
                  <div className="flex items-center gap-1">
                    <Link
                      href="/profile"
                      className="rounded-xl px-3 py-2 hover:bg-slate-100"
                    >
                      {userInfo.name}
                    </Link>

                    <Link href="/profile/orders" className="nav-link">
                      Orders
                    </Link>

                    <button
                      type="button"
                      className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                      onClick={logoutHandler}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100"
                  >
                    <FaUser />
                    <span>Sign In</span>
                  </Link>
                )
              ) : null}
            </div>
          </nav>
        </div>

        <div className="pb-3 md:hidden">
          <SearchBox />
        </div>
      </div>
    </header>
  );
};

export default Header;
