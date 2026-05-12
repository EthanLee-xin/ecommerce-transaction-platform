"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Loader from "@/components/Loader";

const PrivateRoute = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));

    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (mounted && !userInfo) {
      router.replace("/login");
    }
  }, [mounted, router, userInfo]);

  if (!mounted) {
    return <Loader />;
  }

  if (!userInfo) {
    return <Loader />;
  }

  return children;
};

export default PrivateRoute;
