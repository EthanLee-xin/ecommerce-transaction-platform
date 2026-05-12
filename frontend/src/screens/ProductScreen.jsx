"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import notify from "@/utils/notify";

import { useCreateReviewMutation } from "@/slices/productsApiSlice";
import Rating from "@/components/Rating";
import Loader from "@/components/Loader";
import Message from "@/components/Message";
import { addToCart } from "@/slices/cartSlice";
import { normalizeImageSrc } from "@/utils/imageUtils";

const ProductScreen = ({ productId, product }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    router.push("/cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating: Number(rating),
        comment,
      }).unwrap();

      setRating("");
      setComment("");
      notify.success("Review created successfully");

      router.refresh();
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  if (!product) {
    return <Message variant="danger">Product not found</Message>;
  }

  const inStock = product.countInStock > 0;

  return (
    <>
      <Link href="/" className="ui-button ui-button-secondary mb-6">
        Go Back
      </Link>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="ui-card overflow-hidden bg-white">
          <div className="product-detail-image bg-slate-100">
            <Image
              src={normalizeImageSrc(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8"
              priority
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              {product.brand}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {product.name}
            </h1>

            <div className="mt-3">
              <Rating
                value={product.rating}
                text={`${product.numReviews} reviews`}
              />
            </div>
          </div>

          <div className="ui-card p-5">
            <p className="text-sm font-medium text-slate-500">Description</p>
            <p className="mt-2 leading-7 text-slate-700">
              {product.description}
            </p>
          </div>

          <div className="ui-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Price</p>
                <p className="mt-1 text-3xl font-bold text-slate-950">
                  ${product.price}
                </p>
              </div>

              <span
                className={
                  inStock
                    ? "ui-badge ui-badge-success"
                    : "ui-badge ui-badge-danger"
                }
              >
                {inStock ? "In Stock" : "Out Of Stock"}
              </span>
            </div>

            {inStock && (
              <div className="mt-5">
                <label htmlFor="qty" className="ui-label">
                  Quantity
                </label>

                <select
                  id="qty"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="ui-input max-w-32"
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              disabled={!inStock}
              onClick={addToCartHandler}
              className="ui-button ui-button-primary mt-6 w-full"
            >
              Add To Cart
            </button>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Customer feedback
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Reviews</h2>
          </div>

          {product.reviews.length === 0 ? (
            <Message>No Reviews</Message>
          ) : (
            <div className="space-y-3">
              {product.reviews.map((review) => (
                <article key={review._id} className="ui-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {review.name}
                      </h3>
                      <Rating value={review.rating} />
                    </div>

                    <p className="text-sm text-slate-500">
                      {review.createdAt.substring(0, 10)}
                    </p>
                  </div>

                  <p className="mt-3 text-slate-700">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="ui-card p-5">
          <h2 className="text-xl font-bold text-slate-950">Write a Review</h2>

          {loadingProductReview && <Loader />}

          {userInfo ? (
            <form onSubmit={submitHandler} className="mt-4 space-y-4">
              <div>
                <label htmlFor="rating" className="ui-label">
                  Rating
                </label>

                <select
                  id="rating"
                  required
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="ui-input"
                >
                  <option value="">Select...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              <div>
                <label htmlFor="comment" className="ui-label">
                  Comment
                </label>

                <textarea
                  id="comment"
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="ui-input"
                />
              </div>

              <button
                disabled={loadingProductReview}
                type="submit"
                className="ui-button ui-button-primary w-full"
              >
                Submit
              </button>
            </form>
          ) : (
            <Message>
              Please <Link href="/login">sign in</Link> to write a review
            </Message>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductScreen;
