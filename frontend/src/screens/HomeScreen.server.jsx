import Link from "next/link";
import Product from "@/components/Product";
import Paginate from "@/components/Paginate";
import ProductCarousel from "@/components/ProductCarousel";
import Message from "@/components/Message";
import { getProducts } from "@/lib/api";

const HomeScreenServe = async ({ keyword = "", pageNumber = "" } = {}) => {
  let data;

  try {
    data = await getProducts({ keyword, pageNumber });
  } catch (error) {
    return <Message variant="danger">Failed to load products</Message>;
  }

  const products = Array.isArray(data) ? data : data?.products || [];
  const pages = data?.pages || 1;
  const page = data?.page || 1;

  return (
    <>
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link href="/" className="btn btn-light mb-4">
          Go Back
        </Link>
      )}

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Curated selection
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Latest Products
          </h1>
        </div>
      </div>

      {products.length === 0 ? (
        <Message>No products found</Message>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      )}

      <Paginate pages={pages} page={page} keyword={keyword} />
    </>
  );
};

export default HomeScreenServe;
