import HomeScreenServer from "@/screens/HomeScreen.server";

const ProductPageNumberPage = async ({ params }) => {
  const { pageNumber } = await params;
  return <HomeScreenServer pageNumber={pageNumber} />;
};

export default ProductPageNumberPage;
