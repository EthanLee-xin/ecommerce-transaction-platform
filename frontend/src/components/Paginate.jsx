import Link from "next/link";

const Paginate = ({ pages, page, isAdmin = false, keyword = "" }) => {
  if (pages <= 1) {
    return null;
  }

  return (
    <nav aria-label='Pagination'>
      <ul className='flex flex-wrap items-center gap-2'>
        {[...Array(pages).keys()].map((x) => {
          const pageNumber = x + 1;

          const href = !isAdmin
            ? keyword
              ? `/search/${keyword}/page/${pageNumber}`
              : `/page/${pageNumber}`
            : `/admin/productlist/${pageNumber}`;

          const active = pageNumber === page;

          return (
            <li key={pageNumber}>
              <Link
                href={href}
                className={
                  active
                    ? 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white'
                    : 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                }
              >
                {pageNumber}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Paginate;
