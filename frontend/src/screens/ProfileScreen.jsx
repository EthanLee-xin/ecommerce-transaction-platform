"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import notify from "@/utils/notify";

import Message from "@/components/Message";
import Loader from "@/components/Loader";
import { useProfileMutation } from "@/slices/usersApiSlice";
import { setCredentials } from "@/slices/authSlice";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      const id = window.requestAnimationFrame(() => {
        setName(userInfo.name);
        setEmail(userInfo.email);
      });

      return () => window.cancelAnimationFrame(id);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    try {
      const res = await updateProfile({
        name,
        email,
        password,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      notify.success("Profile updated successfully");
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="ui-card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          User Profile
        </h1>

        <form onSubmit={submitHandler} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="ui-label">
              Name
            </label>
            <input
              id="name"
              type="text"
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

          <button type="submit" className="ui-button ui-button-primary w-full">
            Update
          </button>

          <Link
            href="/profile/orders"
            className="ui-button ui-button-secondary w-full"
          >
            View My Orders
          </Link>

          {loadingUpdateProfile && <Loader />}
        </form>
      </div>
    </section>
  );
};

export default ProfileScreen;
