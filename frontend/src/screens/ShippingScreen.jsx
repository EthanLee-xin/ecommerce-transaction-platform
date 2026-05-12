"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import FormContainer from "@/components/FormContainer";
import { saveShippingAddress } from "@/slices/cartSlice";

const ShippingScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { shippingAddress } = useSelector((state) => state.cart);

  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || "",
  );
  const [country, setCountry] = useState(shippingAddress.country || "");

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    router.push("/payment");
  };

  return (
    <FormContainer>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Checkout
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Shipping Address
        </h1>
      </div>

      <form onSubmit={submitHandler} className="mt-6 space-y-4">
        <div>
          <label htmlFor="address" className="ui-label">
            Address
          </label>
          <input
            id="address"
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="ui-input"
          />
        </div>

        <div>
          <label htmlFor="city" className="ui-label">
            City
          </label>
          <input
            id="city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="ui-input"
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="ui-label">
            Postal Code
          </label>
          <input
            id="postalCode"
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="ui-input"
          />
        </div>

        <div>
          <label htmlFor="country" className="ui-label">
            Country
          </label>
          <input
            id="country"
            type="text"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="ui-input"
          />
        </div>

        <button type="submit" className="ui-button ui-button-primary w-full">
          Continue
        </button>
      </form>
    </FormContainer>
  );
};

export default ShippingScreen;
