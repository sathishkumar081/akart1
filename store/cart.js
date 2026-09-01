import { KEYS, read, write } from './storage.js';

const readCart = () => JSON.parse(sessionStorage.getItem(KEYS.CART) || '[]');
const writeCart = (data) => sessionStorage.setItem(KEYS.CART, JSON.stringify(data));

export const getCart = () => readCart();

export const addToCart = (productId, quantity = 1) => {
  const cart = readCart();
  const item = cart.find(i => i.productId === productId);
  if (item) item.quantity += quantity; else cart.push({ productId, quantity });
  writeCart(cart); window.dispatchEvent(new Event('cart-updated'));
};

export const updateCartItemQuantity = (productId, quantity) => {
  let cart = readCart();
  const item = cart.find(i => i.productId === productId);
  if (item) item.quantity = quantity;
  if (item && item.quantity <= 0) cart = cart.filter(i => i.productId !== productId);
  writeCart(cart); window.dispatchEvent(new Event('cart-updated'));
};

export const removeFromCart = (productId) => {
  const cart = readCart().filter(i => i.productId !== productId);
  writeCart(cart); window.dispatchEvent(new Event('cart-updated'));
};

export const clearCart = () => { writeCart([]); window.dispatchEvent(new Event('cart-updated')); };