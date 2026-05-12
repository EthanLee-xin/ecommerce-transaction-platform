"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import notify from "@/utils/notify";

import Loader from "@/components/Loader";
import FormContainer from "@/components/FormContainer";
import { useRegisterMutation } from "@/slices/usersApiSlice";
import { setCredentials } from "@/slices/authSlice";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const redirect = searchParams.get("redirect") || "/";

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      router.push(redirect);
    }
  }, [router, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
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
          Create account
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Register for ProShop
        </h1>
      </div>

      <form onSubmit={submitHandler} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="ui-label">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ui-input"
          />
        </div>

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

        <div>
          <label htmlFor="confirmPassword" className="ui-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="ui-input"
          />
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="ui-button ui-button-primary w-full"
        >
          Register
        </button>

        {isLoading && <Loader />}
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href={redirect ? `/login?redirect=${redirect}` : "/login"}
          className="font-semibold text-slate-950 hover:text-indigo-600"
        >
          Login
        </Link>
      </p>
    </FormContainer>
  );
};

export default RegisterScreen;
