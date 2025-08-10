"use client";

import { useActionState } from "react"; // ✅ من react نفسها
import { useFormStatus } from "react-dom"; // فقط useFormStatus من react-dom

import { addProduct } from "../actions";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? "جاري الإضافة..." : "إضافة المنتج"}
    </button>
  );
}

export default function NewProductPage() {
  const initialState = { error: null };

  const addProductAction = async (prevState, formData) => {
    const result = await addProduct(formData);
    return result;
  };

  const [state, formAction] = useActionState(addProductAction, initialState);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">إضافة منتج جديد</h1>

      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            اسم المنتج
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            الوصف
          </label>
          <textarea
            name="description"
            id="description"
            rows="4"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            السعر
          </label>
          <input
            type="number"
            name="price"
            id="price"
            step="0.01"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            صورة المنتج
          </label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
