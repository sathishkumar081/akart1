import { KEYS, read, write } from './storage.js';
export const getPayments = () => read(KEYS.PAYMENTS);
export const setPaymentStatus = (id, status) => {
  const list = getPayments().map(p=>p.id===id?{...p, status, verificationStatus: status, reviewedAt:new Date().toISOString()}:p);
  write(KEYS.PAYMENTS, list);
};
export const updatePayment = (id, changes) => {
  const list = getPayments().map(payment=>payment.id===id?{...payment,...changes,reviewedAt:new Date().toISOString()}:payment);
  write(KEYS.PAYMENTS,list);
  return list.find(payment=>payment.id===id) || null;
};
export const addPayment = payment => {
  const record = { id:`PMT${Date.now()}`, paymentMethod:'Razorpay payment link', status:'Pending', verificationStatus:'Pending Manual Verification', createdAt:new Date().toISOString(), ...payment };
  write(KEYS.PAYMENTS, [...getPayments(), record]);
  return record;
};
export const seedPayments = () => {
  const seeded = [
    { id: 'demo-payment-success', demo:true, orderId:'DEMO-ORD-101', customerId:'demo_customer', customer: 'Demo Customer', seller:'Demo Farmer', product: 'Tomato', amount: 200, paymentMethod:'UPI', txnId: 'RZP_DEMO_001', status: 'Successful', verificationStatus:'Successful', createdAt:'2026-08-28T10:30:00.000Z' },
    { id: 'demo-payment-pending', demo:true, orderId:'DEMO-ORD-102', customerId:'customer1', customer: 'Arjun Kumar', seller:'Demo Farmer', product: 'Potato', amount: 125, paymentMethod:'Razorpay payment link', txnId: 'RZP_DEMO_002', status: 'Pending', verificationStatus:'Pending Manual Verification', createdAt:'2026-08-30T09:15:00.000Z' },
    { id: 'demo-payment-failed', demo:true, orderId:'DEMO-ORD-103', customerId:'demo_customer', customer: 'Demo Customer', seller:'Ram Singh', product: 'Onion', amount: 300, paymentMethod:'Card', txnId: 'RZP_DEMO_003', status: 'Failed', verificationStatus:'Failed', createdAt:'2026-08-31T14:20:00.000Z' }
  ];
  const existing = getPayments();
  seeded.forEach(record => { if (!existing.some(item => item.id === record.id)) existing.push(record); });
  write(KEYS.PAYMENTS, existing);
};
