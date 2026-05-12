"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Message from "@/components/Message";
import { useGetTopProductsQuery } from "@/slices/productsApiSlice";
import { normalizeImageSrc } from "@/utils/imageUtils";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: products, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <Message variant="danger">{error?.data?.message || error.error}</Message>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const activeProduct = products[activeIndex];

  const previousProduct = () => {
    setActiveIndex((current) =>
      current === 0 ? products.length - 1 : current - 1,
    );
  };

  const nextProduct = () => {
    setActiveIndex((current) =>
      current === products.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <section className="relative left-1/2 right-1/2 mb-10 -ml-[50vw] -mr-[50vw] -mt-6 w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white sm:-mt-8">
      <div className="app-container py-8 sm:py-10 lg:py-12">
        <div className="grid min-h-[420px] items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
              Top rated
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Featured picks
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-300">
              Discover customer favorites selected from the highest rated
              products in the catalog.
            </p>

            <div className="mt-8">
              <Link
                href={`/product/${activeProduct._id}`}
                className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200"
              >
                View Product
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl bg-white p-6 shadow-2xl shadow-indigo-950/40">
              <button
                type="button"
                onClick={previousProduct}
                className="absolute left-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-950 shadow-lg hover:bg-indigo-50 hover:text-indigo-700 sm:-left-6"
                aria-label="Previous product"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                onClick={nextProduct}
                className="absolute right-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-950 shadow-lg hover:bg-indigo-50 hover:text-indigo-700 sm:-right-6"
                aria-label="Next product"
              >
                <FaChevronRight />
              </button>
              <Link href={`/product/${activeProduct._id}`}>
                <div className="relative h-[420px] sm:h-[420px]">
                  <Image
                    src={normalizeImageSrc(activeProduct.image)}
                    alt={activeProduct.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            <div className="mx-auto -mt-10 max-w-lg rounded-2xl border border-white/10 bg-slate-950/90 p-5 shadow-xl backdrop-blur">
              <Link href={`/product/${activeProduct._id}`}>
                <h3 className="line-clamp-2 text-xl font-bold tracking-tight hover:text-cyan-300">
                  {activeProduct.name}
                </h3>
              </Link>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-2xl font-bold">${activeProduct.price}</p>

                <div className="flex items-center gap-2">
                  {products.map((product, index) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={
                        index === activeIndex
                          ? "h-2.5 w-8 rounded-full bg-cyan-300"
                          : "h-2.5 w-2.5 rounded-full bg-white/30 hover:bg-white/60"
                      }
                      aria-label={`Go to product ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
