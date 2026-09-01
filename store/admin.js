import { KEYS, read, write } from './storage.js';

const initial = () => ({
  logistics: [
    { id:'demo-log-1', demo:true, orderId:'DEMO-ORD-101', pickup:'Guntur, AP', delivery:'Hyderabad, TS', customer:'Demo Customer', farmer:'Demo Farmer', product:'Tomato', partner:'Ekart', trackingId:'EKT-DEMO-101', status:'In Transit' },
    { id:'demo-log-2', demo:true, orderId:'DEMO-ORD-102', pickup:'Amritsar, Punjab', delivery:'Delhi', customer:'Arjun Kumar', farmer:'Ram Singh', product:'Potato', partner:'Ekart', trackingId:'EKT-DEMO-102', status:'Assigned' },
    { id:'demo-log-3', demo:true, orderId:'DEMO-ORD-103', pickup:'Rohtak, Haryana', delivery:'Jaipur, Rajasthan', customer:'Demo Customer', farmer:'Sita Devi', product:'Onion', partner:'Ekart', trackingId:'EKT-DEMO-103', status:'Delivered' }
  ],
  complaints: [
    { id:'demo-ticket-1', demo:true, submittedBy:'Demo Customer', role:'customer', category:'Delivery', subject:'Delivery ETA requested', status:'Open', createdAt:'2026-08-31T12:00:00.000Z' },
    { id:'demo-ticket-2', demo:true, submittedBy:'Demo Farmer', role:'farmer', category:'Payment', subject:'Payment awaiting verification', status:'Escalated', createdAt:'2026-08-30T08:30:00.000Z' }
  ],
  notifications: [
    { id:'demo-note-1', demo:true, type:'product', text:'New farmer ad awaiting review', unread:true },
    { id:'demo-note-2', demo:true, type:'payment', text:'Payment awaiting verification', unread:true },
    { id:'demo-note-3', demo:true, type:'waste', text:'Waste to Company request received', unread:true },
    { id:'demo-note-4', demo:true, type:'complaint', text:'Support ticket escalated', unread:true }
  ]
});

export const initializeAdminData = () => {
  const current = read(KEYS.ADMIN_DATA);
  if (!current || Array.isArray(current)) write(KEYS.ADMIN_DATA, initial());
};
export const getAdminData = () => {
  const data = read(KEYS.ADMIN_DATA);
  return data && !Array.isArray(data) ? data : initial();
};
export const updateAdminRecord = (collection, id, changes) => {
  const data = getAdminData();
  if (!Array.isArray(data[collection])) return null;
  data[collection] = data[collection].map(item => item.id === id ? { ...item, ...changes, updatedAt:new Date().toISOString() } : item);
  write(KEYS.ADMIN_DATA, data);
  return data[collection].find(item => item.id === id) || null;
};
export const addAdminNotification = (type, text, targetId='') => {
  const data = getAdminData();
  data.notifications = [...(data.notifications || []), { id:`NOTE${Date.now()}${Math.random().toString(16).slice(2,6)}`, type, text, targetId, unread:true, createdAt:new Date().toISOString() }];
  write(KEYS.ADMIN_DATA,data);
};

export const resetDemoData = () => {
  const data = getAdminData();
  const seed = initial();
  Object.keys(seed).forEach(key => { data[key] = [...(data[key] || []).filter(item => !item.demo), ...seed[key]]; });
  write(KEYS.ADMIN_DATA, data);

  const products = read(KEYS.PRODUCTS).filter(item => !item.demo);
  const demoProducts = demoProductRecords();
  write(KEYS.PRODUCTS, [...products, ...demoProducts]);

  const payments = read(KEYS.PAYMENTS).filter(item => !item.demo);
  write(KEYS.PAYMENTS, [...payments, ...demoPaymentRecords()]);

  const waste = read(KEYS.W2C).filter(item => !item.demo);
  write(KEYS.W2C, [...waste, ...demoWasteRecords()]);
  const orders = read(KEYS.ORDERS).filter(item => !item.demo);
  write(KEYS.ORDERS, [...orders, ...demoOrderRecords()]);
  const services = read(KEYS.AGRI_SERVICES);
  if (services && !Array.isArray(services)) {
    services.tractors = (services.tractors || []).map((item,index)=>item.demo?{...item,verificationStatus:index<2?'Verified':index===2?'Pending Inspection':'Needs Information',verified:index<2}:item);
    services.drones = (services.drones || []).map((item,index)=>item.demo?{...item,verificationStatus:index<2?'Verified':'Pending Review',verified:index<2}:item);
    services.fertilizers = (services.fertilizers || []).map((item,index)=>item.demo?{...item,verificationStatus:index<2?'Verified':index===2?'Pending Verification':index===3?'Needs Documentation':'Verified',verified:index<2||index>3}:item);
    write(KEYS.AGRI_SERVICES, services);
  }
  const flags = JSON.parse(localStorage.getItem(KEYS.FARMER_FLAGS) || '{}');
  delete flags.demo_farmer; delete flags.demo_customer;
  localStorage.setItem(KEYS.FARMER_FLAGS, JSON.stringify(flags));
  window.dispatchEvent(new Event('products-updated'));
  return true;
};

export const demoProductRecords = () => [
  { id:'demo-prod-tomato', demo:true, name:'Demo Tomato', category:'Produce', price:'38', unit:'kg', quantity:'120', location:'Guntur, Andhra Pradesh', description:'Freshly harvested table tomatoes.', farmerId:'demo_farmer', imageUrl:'assets/tomato.png', status:'Pending Review', harvestDate:'2026-08-30', createdAt:'2026-08-30T07:30:00.000Z' },
  { id:'demo-prod-potato', demo:true, name:'Demo Potato', category:'Produce', price:'28', unit:'kg', quantity:'200', location:'Guntur, Andhra Pradesh', description:'Clean graded potatoes.', farmerId:'demo_farmer', imageUrl:'assets/potato.png', status:'Pending Review', harvestDate:'2026-08-27', createdAt:'2026-08-29T09:10:00.000Z' },
  { id:'demo-prod-spinach', demo:true, name:'Demo Spinach', category:'Leafy Vegetables', price:'22', unit:'bunch', quantity:'60', location:'Guntur, Andhra Pradesh', description:'Fresh spinach bunches.', farmerId:'demo_farmer', imageUrl:'assets/spinach.png', status:'Pending Review', harvestDate:'2026-08-31', createdAt:'2026-08-31T06:20:00.000Z' },
  { id:'demo-prod-onion', demo:true, name:'Demo Onion', category:'Produce', price:'42', unit:'kg', quantity:'150', location:'Guntur, Andhra Pradesh', description:'Dry red onions, graded.', farmerId:'demo_farmer', imageUrl:'assets/onion.png', status:'Approved', createdAt:'2026-08-25T10:00:00.000Z' },
  { id:'demo-prod-carrot', demo:true, name:'Demo Carrot', category:'Produce', price:'55', unit:'kg', quantity:'80', location:'Guntur, Andhra Pradesh', description:'Washed fresh carrots.', farmerId:'demo_farmer', imageUrl:'assets/carrot.png', status:'Approved', createdAt:'2026-08-26T10:00:00.000Z' }
];
export const demoPaymentRecords = () => [
  { id:'demo-payment-success', demo:true, orderId:'DEMO-ORD-101', customerId:'demo_customer', customer:'Demo Customer', seller:'Demo Farmer', product:'Demo Onion', amount:200, paymentMethod:'UPI', txnId:'RZP_DEMO_001', status:'Successful', verificationStatus:'Successful', createdAt:'2026-08-28T10:30:00.000Z' },
  { id:'demo-payment-pending', demo:true, orderId:'DEMO-ORD-102', customerId:'customer1', customer:'Arjun Kumar', seller:'Demo Farmer', product:'Demo Potato', amount:125, paymentMethod:'Razorpay payment link', txnId:'RZP_DEMO_002', status:'Pending', verificationStatus:'Pending Manual Verification', createdAt:'2026-08-30T09:15:00.000Z' },
  { id:'demo-payment-failed', demo:true, orderId:'DEMO-ORD-103', customerId:'demo_customer', customer:'Demo Customer', seller:'Ram Singh', product:'Onion', amount:300, paymentMethod:'Card', txnId:'RZP_DEMO_003', status:'Failed', verificationStatus:'Failed', createdAt:'2026-08-31T14:20:00.000Z' }
];
export const demoWasteRecords = () => [
  { id:'demo-waste-1', demo:true, farmerId:'demo_farmer', name:'Overripe Tomato', quantity:'45 kg', originalPrice:38, requestedBuyback:24, buyback:24, condition:'Overripe, usable for compost', status:'Pending Review', at:'2026-08-30T12:00:00.000Z', history:[{status:'Pending Review',at:'2026-08-30T12:00:00.000Z',actor:'demo_farmer'}] },
  { id:'demo-waste-2', demo:true, farmerId:'farmer1', name:'Broken Wheat', quantity:'80 kg', originalPrice:35, requestedBuyback:20, buyback:20, condition:'Dry, suitable for agricultural reuse', status:'Approved', at:'2026-08-28T11:00:00.000Z', history:[{status:'Approved',at:'2026-08-29T11:00:00.000Z',actor:'demo_admin'}] },
  { id:'demo-waste-3', demo:true, farmerId:'farmer2', name:'Cabbage Leaves', quantity:'30 kg', originalPrice:40, requestedBuyback:15, buyback:15, condition:'Organic processing grade', status:'Collected', at:'2026-08-26T11:00:00.000Z', history:[{status:'Collected',at:'2026-08-28T11:00:00.000Z',actor:'demo_admin'}] }
];
export const demoOrderRecords = () => [
  { id:'DEMO-ORD-101', demo:true, customerId:'demo_customer', items:[{productId:'demo-prod-onion',farmerId:'demo_farmer',name:'Demo Onion',quantity:5,unit:'kg',price:40}], total:200, status:'Processing', paymentStatus:'Successful', deliveryStatus:'In Transit', createdAt:'2026-08-28T10:30:00.000Z' },
  { id:'DEMO-ORD-102', demo:true, customerId:'customer1', items:[{productId:'demo-prod-potato',farmerId:'demo_farmer',name:'Demo Potato',quantity:5,unit:'kg',price:25}], total:125, status:'Order Received', paymentStatus:'Pending Manual Verification', deliveryStatus:'Assigned', createdAt:'2026-08-30T09:15:00.000Z' },
  { id:'DEMO-ORD-103', demo:true, customerId:'demo_customer', items:[{productId:'prod3',farmerId:'farmer1',name:'Onion',quantity:7.5,unit:'kg',price:40}], total:300, status:'Payment Failed', paymentStatus:'Failed', deliveryStatus:'Order Received', createdAt:'2026-08-31T14:20:00.000Z' }
];
