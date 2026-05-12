"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import notify from "@/utils/notify";

import Message from "@/components/Message";
import Loader from "@/components/Loader";
import FormContainer from "@/components/FormContainer";
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@/slices/productsApiSlice";

const ProductEditScreen = ({ productId }) => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  useEffect(() => {
    if (product) {
      const id = window.requestAnimationFrame(() => {
        setName(product.name);
        setPrice(product.price);
        setImage(product.image);
        setBrand(product.brand);
        setCategory(product.category);
        setCountInStock(product.countInStock);
        setDescription(product.description);
      });

      return () => window.cancelAnimationFrame(id);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateProduct({
        productId,
        name,
        price: Number(price),
        image,
        brand,
        category,
        description,
        countInStock: Number(countInStock),
      }).unwrap();

      notify.success("Product updated");
      refetch();
      router.push("/admin/productlist");
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProductImage(formData).unwrap();
      notify.success(res.message);
      setImage(res.image);
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link href="/admin/productlist" className='ui-button ui-button-secondary mb-6'>
        Go Back
      </Link>

      <FormContainer>
      <p className='admin-eyebrow'>Admin</p>
        <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-950'>
          Edit Product
        </h1>

        {loadingUpdate && <Loader />}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <form onSubmit={submitHandler} className='admin-form mt-6'>
            <div>
              <label htmlFor='name' className='ui-label'>
                Name
              </label>
              <input
                id='name'
                type='text'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='ui-input'
              />
            </div>

            <div>
              <label htmlFor='price' className='ui-label'>
                Price
              </label>
              <input
                id='price'
                type='number'
                placeholder='Enter price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className='ui-input'
              />
            </div>

            <div>
              <label htmlFor='image' className='ui-label'>
                Image
              </label>
              <input
                id='image'
                type='text'
                placeholder='Enter image url'
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className='ui-input'
              />

              <input
                type='file'
                onChange={uploadFileHandler}
                className='mt-3 block w-full rounded-xl border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800'
              />

              {loadingUpload && <Loader />}
            </div>

            <div>
              <label htmlFor='brand' className='ui-label'>
                Brand
              </label>
              <input
                id='brand'
                type='text'
                placeholder='Enter brand'
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className='ui-input'
              />
            </div>

            <div>
              <label htmlFor='countInStock' className='ui-label'>
                Count In Stock
              </label>
              <input
                id='countInStock'
                type='number'
                placeholder='Enter countInStock'
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                className='ui-input'
              />
            </div>

            <div>
              <label htmlFor='category' className='ui-label'>
                Category
              </label>
              <input
                id='category'
                type='text'
                placeholder='Enter category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='ui-input'
              />
            </div>

            <div>
              <label htmlFor='description' className='ui-label'>
                Description
              </label>
              <textarea
                id='description'
                rows={4}
                placeholder='Enter description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='ui-input'
              />
            </div>

            <button type='submit' className='ui-button ui-button-primary w-full'>
              Update
            </button>
          </form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
