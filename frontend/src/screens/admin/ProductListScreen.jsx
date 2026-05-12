"use client";

import Link from "next/link";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import notify from "@/utils/notify";

import Message from "@/components/Message";
import Loader from "@/components/Loader";
import Paginate from "@/components/Paginate";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
} from "@/slices/productsApiSlice";

const ProductListScreen = ({ pageNumber = "" }) => {
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    pageNumber,
  });

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const [createProduct, { isLoading: loadingCreate }] =
    useCreateProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure")) {
      try {
        await deleteProduct(id).unwrap();
        refetch();
        notify.success("Product deleted");
      } catch (err) {
        notify.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = async () => {
    if (window.confirm("Are you sure you want to create a new product?")) {
      try {
        await createProduct().unwrap();
        refetch();
        notify.success("Product created");
      } catch (err) {
        notify.error(err?.data?.message || err.error);
      }
    }
  };

  const products = data?.products || [];
  const pages = data?.pages || 1;
  const page = data?.page || 1;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-title">Products</h1>
        </div>

        <button
          type="button"
          className="ui-button ui-button-primary gap-2"
          onClick={createProductHandler}
        >
          <FaPlus />
          Create Product
        </button>
      </div>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">ID</th>
                  <th className="admin-th">Name</th>
                  <th className="admin-th">Price</th>
                  <th className="admin-th">Category</th>
                  <th className="admin-th">Brand</th>
                  <th className="admin-th"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="admin-td font-mono text-xs">
                      {product._id}
                    </td>
                    <td className="admin-td font-medium text-slate-950">
                      {product.name}
                    </td>
                    <td className="admin-td font-semibold">${product.price}</td>
                    <td className="admin-td">{product.category}</td>
                    <td className="admin-td">{product.brand}</td>
                    <td className="admin-td">
                      <div className="admin-action-row">
                        <Link
                          href={`/admin/product/${product._id}/edit`}
                          className="icon-button"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          type="button"
                          className="icon-button icon-button-danger"
                          onClick={() => deleteHandler(product._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Paginate pages={pages} page={page} isAdmin />
          </div>
        </>
      )}
    </>
  );
};

export default ProductListScreen;
