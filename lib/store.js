"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addToCart: (product, quantity = 1) => {
        // فحص حالة المخزون قبل الإضافة
        if (!product.in_stock) {
          // يمكنك إظهار toast هنا أو إرجاع خطأ
          console.warn("المنتج غير متوفر حالياً");
          return false; // إرجاع false للدلالة على فشل الإضافة
        }

        const items = get().items;
        const productId = product.id;
        const existingItem = items.find((item) => item.id === productId);
        const productPrice = product.salePrice || product.price || 0;

        if (existingItem) {
          const updatedItems = items.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );

          set((state) => ({
            items: updatedItems,
            totalItems: state.totalItems + quantity,
            totalPrice: state.totalPrice + productPrice * quantity,
          }));
        } else {
          const cartItem = {
            id: productId,
            title: product.title,
            price: product.price,
            salePrice: productPrice,
            image_url: product.image_url || product.image || "",
            quantity: quantity,
            in_stock: product.in_stock, // حفظ حالة المخزون
          };

          set((state) => ({
            items: [...state.items, cartItem],
            totalItems: state.totalItems + quantity,
            totalPrice: state.totalPrice + productPrice * quantity,
          }));
        }

        return true; // إرجاع true للدلالة على نجاح الإضافة
      },

      removeFromCart: (productId) => {
        const items = get().items;
        const itemToRemove = items.find((item) => item.id === productId);

        if (itemToRemove) {
          const itemPrice = itemToRemove.salePrice || itemToRemove.price || 0;

          set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
            totalItems: state.totalItems - itemToRemove.quantity,
            totalPrice: state.totalPrice - itemPrice * itemToRemove.quantity,
          }));
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;

        const items = get().items;
        const itemToUpdate = items.find((item) => item.id === productId);

        if (itemToUpdate) {
          const quantityDiff = quantity - itemToUpdate.quantity;
          const itemPrice = itemToUpdate.salePrice || itemToUpdate.price || 0;

          const updatedItems = items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          );

          set((state) => ({
            items: updatedItems,
            totalItems: state.totalItems + quantityDiff,
            totalPrice: state.totalPrice + itemPrice * quantityDiff,
          }));
        }
      },

      // إزالة المنتجات غير المتوفرة من السلة
      removeOutOfStockItems: () => {
        const items = get().items;
        const inStockItems = items.filter((item) => item.in_stock !== false);
        const outOfStockItems = items.filter((item) => item.in_stock === false);

        if (outOfStockItems.length > 0) {
          // حساب المجموع الجديد
          const newTotalItems = inStockItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const newTotalPrice = inStockItems.reduce((sum, item) => {
            const price = item.salePrice || item.price || 0;
            return sum + price * item.quantity;
          }, 0);

          set({
            items: inStockItems,
            totalItems: newTotalItems,
            totalPrice: newTotalPrice,
          });

          return outOfStockItems; // إرجاع المنتجات المحذوفة للإشعار
        }

        return [];
      },

      // تحديث حالة المخزون لمنتج في السلة
      updateProductStock: (productId, inStock) => {
        const items = get().items;
        const updatedItems = items.map((item) =>
          item.id === productId ? { ...item, in_stock: inStock } : item
        );

        set((state) => ({
          ...state,
          items: updatedItems,
        }));

        // إذا أصبح المنتج غير متوفر، قم بإزالته من السلة
        if (!inStock) {
          get().removeFromCart(productId);
        }
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },
    }),
    {
      name: "cart-storage",
      getStorage: () =>
        typeof window !== "undefined" ? localStorage : undefined,
    }
  )
);
