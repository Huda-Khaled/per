'use client';
import { create } from 'zustand';

import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const productId = product.id;
        const existingItem = items.find(item => item.id === productId);
        const productPrice = product.salePrice || product.price || 0;

        if (existingItem) {
          const updatedItems = items.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );

          set(state => ({
            items: updatedItems,
            totalItems: state.totalItems + quantity,
            totalPrice: state.totalPrice + (productPrice * quantity)
          }));
        } else {
          const cartItem = {
            id: productId,
            title: product.title,
            price: product.price,
            salePrice: productPrice,
            image_url: product.image_url || product.image || '',
            quantity: quantity
          };

          set(state => ({
            items: [...state.items, cartItem],
            totalItems: state.totalItems + quantity,
            totalPrice: state.totalPrice + (productPrice * quantity)
          }));
        }
      },

      removeFromCart: (productId) => {
        const items = get().items;
        const itemToRemove = items.find(item => item.id === productId);
        
        if (itemToRemove) {
          const itemPrice = itemToRemove.salePrice || itemToRemove.price || 0;

          set(state => ({
            items: state.items.filter(item => item.id !== productId),
            totalItems: state.totalItems - itemToRemove.quantity,
            totalPrice: state.totalPrice - (itemPrice * itemToRemove.quantity)
          }));
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;

        const items = get().items;
        const itemToUpdate = items.find(item => item.id === productId);

        if (itemToUpdate) {
          const quantityDiff = quantity - itemToUpdate.quantity;
          const itemPrice = itemToUpdate.salePrice || itemToUpdate.price || 0;

          const updatedItems = items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          );

          set(state => ({
            items: updatedItems,
            totalItems: state.totalItems + quantityDiff,
            totalPrice: state.totalPrice + (itemPrice * quantityDiff)
          }));
        }
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
      }
    }),
    {
      name: 'cart-storage',
      getStorage: () => typeof window !== 'undefined' ? localStorage : undefined, 
    }
  )
);


