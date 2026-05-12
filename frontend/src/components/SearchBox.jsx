"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBox = () => {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();

    const cleanKeyword = keyword.trim();

    if (cleanKeyword) {
      router.push(`/search/${cleanKeyword}`);
      setKeyword("");
    } else {
      router.push("/");
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex w-full items-center gap-2">
      <input
        type="text"
        name="q"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search Products..."
        className="ui-input h-10"
      />

      <button type="submit" className="ui-button ui-button-primary">
        Search
      </button>
    </form>
  );
};

export default SearchBox;
