import ProductScreen from "@/screens/ProductScreen";
import { getProductById } from "@/lib/api";

export const generateMetadata = async ({ params }) => {
  const { id } = await params;

  try {
    const product = await getProductById(id);

    return {
      title: `${product.name}`,
      description: product.description,
    };
  } catch (error) {
    return {
      title: "Product Not Found",
      description: "Product details could not be loaded",
    };
  }
};

const ProductDetailsPage = async ({ params }) => {
  const { id } = await params;
  const product = await getProductById(id);

  return <ProductScreen productId={id} product={product} />;
};

export default ProductDetailsPage;
