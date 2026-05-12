import HomeScreenServer from "@/screens/HomeScreen.server";

const SearchPage = async ({ params }) => {
  const { keyword } = await params;
  return <HomeScreenServer keyword={keyword} />;
};

export default SearchPage;
