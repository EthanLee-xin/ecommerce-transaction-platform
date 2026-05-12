import HomeScreenServer from "@/screens/HomeScreen.server";

const SearchPageNumberPage = async ({ params }) => {
  const { keyword, pageNumber } = await params;
  return <HomeScreenServer keyword={keyword} pageNumber={pageNumber} />;
};

export default SearchPageNumberPage;
