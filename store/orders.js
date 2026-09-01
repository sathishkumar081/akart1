import { KEYS, read, write } from './storage.js';
import { addAdminNotification } from './admin.js';

const ORDER_KEY = KEYS.ORDERS;

export const getOrders = (customerId) => read(ORDER_KEY).filter(order => !customerId || order.customerId === customerId);

export const createOrder = (customerId, items, products) => {
  const orderItems = items.map(item => {
    const product = products.find(candidate => candidate.id === item.productId);
    return product ? { productId: product.id, farmerId: product.farmerId, name: product.name, quantity: item.quantity, unit: product.unit, price: Number(product.price) } : null;
  }).filter(Boolean);
  if (!customerId || !orderItems.length) return null;
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isDemo = String(customerId).startsWith('demo_') || orderItems.some(item=>String(item.farmerId).startsWith('demo_'));
  const order = { id: `ORD${Date.now()}`, demo:isDemo, customerId, items: orderItems, total, status: 'Order Received', paymentStatus: 'Pending Manual Verification', deliveryStatus: 'Order Received', createdAt: new Date().toISOString() };
  write(ORDER_KEY, [...read(ORDER_KEY), order]);
  const customers = read(KEYS.USERS); const customer = customers.find(user => user.id === customerId);
  const payments = read(KEYS.PAYMENTS);
  payments.push({ id:`PMT${Date.now()}`, demo:isDemo, orderId:order.id, customerId, customer:customer?.name || 'Customer', seller:orderItems.map(item => customers.find(user=>user.id===item.farmerId)?.name || 'Farmer').filter((v,i,a)=>a.indexOf(v)===i).join(', '), product:orderItems.map(item=>item.name).join(', '), amount:total, paymentMethod:'Razorpay payment link', txnId:'Awaiting reference', status:'Pending', verificationStatus:'Pending Manual Verification', createdAt:order.createdAt });
  write(KEYS.PAYMENTS, payments);
  addAdminNotification('payment',`Payment awaiting verification for ${order.id}`,order.id);
  return order;
};

export const updateOrderStatus = (orderId, status) => {
  const orders = read(ORDER_KEY).map(order => order.id === orderId ? { ...order, status } : order);
  write(ORDER_KEY, orders);
  return orders.find(order => order.id === orderId) || null;
};
export const updateOrder = (orderId, changes) => {
  const orders = read(ORDER_KEY).map(order => order.id === orderId ? { ...order, ...changes, updatedAt:new Date().toISOString() } : order);
  write(ORDER_KEY, orders);
  return orders.find(order => order.id === orderId) || null;
};
