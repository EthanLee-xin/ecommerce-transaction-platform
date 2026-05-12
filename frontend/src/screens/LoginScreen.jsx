"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import notify from "@/utils/notify";

import Loader from "@/components/Loader";
import FormContainer from "@/components/FormContainer";
import { useLoginMutation } from "@/slices/usersApiSlice";
import { setCredentials } from "@/slices/authSlice";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const redirect = searchParams.get("redirect") || "/";

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      router.push(redirect);
    }
  }, [router, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      router.push(redirect);
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Welcome back
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Sign in to your account
        </h1>
      </div>

      <form onSubmit={submitHandler} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="ui-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ui-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="ui-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ui-input"
          />
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="ui-button ui-button-primary w-full"
        >
          Sign In
        </button>

        {isLoading && <Loader />}
      </form>

      <p className="mt-6 text-sm text-slate-500">
        New customer?{" "}
        <Link
          href={redirect ? `/register?redirect=${redirect}` : "/register"}
          className="font-semibold text-slate-950 hover:text-indigo-600"
        >
          Register
        </Link>
      </p>
    </FormContainer>
  );
};

export default LoginScreen;
