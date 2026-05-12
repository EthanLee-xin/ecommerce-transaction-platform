import Link from "next/link";
import Image from "next/image";
import Rating from "@/components/Rating";
import { normalizeImageSrc } from "@/utils/imageUtils";

const Product = ({ product }) => {
  return (
    <article className="ui-card ui-card-hover overflow-hidden">
      <Link href={`/product/${product._id}`} className="block gb-slate-100">
        <div className="product-card-image">
          <Image
            src={normalizeImageSrc(product.image)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition duration-300 hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product._id}`}>
          <h2 className="line-clamp-2 min-h-11 text-sm font-semibold leading-5 text-slate-950 hover:text-indigo-700">
            {product.name}
          </h2>
        </Link>

        <div className="mt-3">
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <p className="text-xl font-bold tracking-tight text-slate-950">
            ${product.price}
          </p>

          <span className="ui-badge ui-badge-brand">In Stock</span>
        </div>
      </div>
    </article>
  );
};

export default Product;
