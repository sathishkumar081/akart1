import { KEYS, read, write, readObj, getRoom } from './storage.js';
import { PRODUCT_CATALOG } from './catalog.js';
import { getServiceThumbnail, getFertilizerVisual } from '../serviceThumbnails.js';
import { initializeAdminData, demoProductRecords, demoWasteRecords, demoOrderRecords } from './admin.js';

const CATALOG_VERSION = '2026-08-12-v2';

const initialUsers = [
  { id: 'farmer1', name: 'Ram Singh', email: 'ram@farm.com', role: 'farmer', accountStatus: 'active', address: '123 Farm Lane, Punjab', createdAt: '2026-05-11T00:00:00.000Z' },
  { id: 'farmer2', name: 'Sita Devi', email: 'sita@farm.com', role: 'farmer', accountStatus: 'active', address: '456 Village Road, Haryana', createdAt: '2026-06-04T00:00:00.000Z' },
  { id: 'customer1', name: 'Arjun Kumar', email: 'arjun@email.com', role: 'customer', accountStatus: 'active', createdAt: '2026-06-17T00:00:00.000Z' },
  { id: 'demo_customer', name: 'Demo Customer', email: 'customer.demo@akart.local', role: 'customer', accountStatus: 'active', demo: true, createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'demo_farmer', name: 'Demo Farmer', email: 'farmer.demo@akart.local', role: 'farmer', accountStatus: 'active', demo: true, address: 'Guntur, Andhra Pradesh', createdAt: '2026-08-01T00:00:00.000Z' },
  { id: 'demo_admin', name: 'AKart Administrator', email: 'admin.demo@akart.local', role: 'admin', accountStatus: 'active', demo: true, createdAt: '2026-08-01T00:00:00.000Z' },
];

const initialProducts = PRODUCT_CATALOG;

const initialAgriServices = {
  tractors: [
    { id: 'tractor1', name: 'Sonalika DI 745 III', price: '₹600/hr', availability: 'Available', location: 'Punjab', imageUrl: 'uploads/image-5.png', ownerId: 'farmer1', sellerName: 'Ram Singh', sellerLocation: 'Amritsar, Punjab', sellerRating: 4.6 },
    { id: 'tractor2', name: 'Mahindra Arjun 555 DI', price: '₹700/hr', availability: 'Available', location: 'Haryana', imageUrl: 'uploads/image-5.png', ownerId: 'farmer2', sellerName: 'Sita Devi', sellerLocation: 'Rohtak, Haryana', sellerRating: 4.4 },
    { id: 'tractor3', name: 'Tractor Rental – 50HP', price: '₹650/hr', availability: 'Available', location: 'UP', imageUrl: 'uploads/image-5.png', ownerId: 'farmer1', sellerName: 'Gurpreet K.', sellerLocation: 'Lucknow, UP', sellerRating: 4.5 },
    { id: 'tractor4', name: 'Ploughing Tractor', price: '₹750/hr', availability: 'Available', location: 'Gujarat', imageUrl: 'uploads/image-5.png', ownerId: 'farmer2', sellerName: 'Vikas Sharma', sellerLocation: 'Ahmedabad, Gujarat', sellerRating: 4.3 },
    { id: 'tractor5', name: '4WD Tractor', price: '₹800/hr', availability: 'Available', location: 'Rajasthan', imageUrl: 'uploads/image-5.png', ownerId: 'farmer1', sellerName: 'Anil Yadav', sellerLocation: 'Jodhpur, Rajasthan', sellerRating: 4.2 },
    { id: 'tractor6', name: 'Cultivator + Tractor', price: '₹900/hr', availability: 'Available', location: 'MP', imageUrl: 'uploads/image-5.png', ownerId: 'farmer2', sellerName: 'Meera Joshi', sellerLocation: 'Bhopal, MP', sellerRating: 4.7 }
  ],
  drones: [
    { id: 'drone1', name: 'Agri-Sprayer 10L', type: 'Spraying', price: '₹1500/use', availability: 'Available', imageUrl: 'uploads/ChatGPT_Image_Aug_25__2026__10_01_34_PM.png', ownerId: 'farmer1', sellerName: 'Rohit Das', sellerLocation: 'Pune, Maharashtra', sellerRating: 4.5 },
    { id: 'drone2', name: 'Survey Drone 4K', type: 'Survey', price: '₹1800/use', availability: 'Available', imageUrl: 'uploads/ChatGPT_Image_Aug_25__2026__10_01_34_PM.png', ownerId: 'farmer2', sellerName: 'Priya Nair', sellerLocation: 'Thiruvananthapuram, Kerala', sellerRating: 4.6 },
    { id: 'drone3', name: 'Sprayer Drone 16L', type: 'Spraying', price: '₹2200/use', availability: 'Available', imageUrl: 'uploads/ChatGPT_Image_Aug_25__2026__10_01_34_PM.png', ownerId: 'farmer1', sellerName: 'Kiran Patel', sellerLocation: 'Surat, Gujarat', sellerRating: 4.4 },
    { id: 'drone4', name: 'Mapping Drone RTK', type: 'Mapping', price: '₹2500/use', availability: 'Available', imageUrl: 'uploads/ChatGPT_Image_Aug_25__2026__10_01_34_PM.png', ownerId: 'farmer2', sellerName: 'Lakshmi Devi', sellerLocation: 'Chennai, Tamil Nadu', sellerRating: 4.7 }
  ],
  fertilizers: [
    { id: 'fert1', name: 'Urea', price: '₹30/kg', quantity: '500kg', type: 'sell', sellerId: 'farmer2', imageUrl: 'uploads/image-8.png', description: 'Nitrogen-rich fertilizer for rapid growth.', sellerName: 'Ram Singh', sellerLocation: 'Amritsar, Punjab', sellerRating: 4.5 },
    { id: 'fert2', name: 'DAP', price: '₹45/kg', quantity: '200kg', type: 'sell', sellerId: 'farmer1', imageUrl: 'uploads/image-8.png', description: 'Diammonium phosphate for strong roots.', sellerName: 'Sita Devi', sellerLocation: 'Hisar, Haryana', sellerRating: 4.3 },
    { id: 'fert3', name: 'MOP', price: '₹40/kg', quantity: '150kg', type: 'sell', sellerId: 'farmer1', imageUrl: 'uploads/image-8.png', description: 'Muriate of Potash for fruiting and flowering.', sellerName: 'Anil Yadav', sellerLocation: 'Jodhpur, Rajasthan', sellerRating: 4.2 },
    { id: 'fert4', name: 'NPK 20-20-20', price: '₹55/kg', quantity: '300kg', type: 'sell', sellerId: 'farmer2', imageUrl: 'uploads/image-8.png', description: 'Balanced nutrients for overall health.', sellerName: 'Meera Joshi', sellerLocation: 'Bhopal, MP', sellerRating: 4.6 },
    { id: 'fert5', name: 'Compost', price: '₹12/kg', quantity: '1000kg', type: 'sell', sellerId: 'farmer2', imageUrl: 'uploads/image-8.png', description: 'Organic compost for soil conditioning.', sellerName: 'Vikas Sharma', sellerLocation: 'Ahmedabad, Gujarat', sellerRating: 4.1 },
    { id: 'fert6', name: 'Vermicompost', price: '₹18/kg', quantity: '800kg', type: 'sell', sellerId: 'farmer1', imageUrl: 'uploads/image-8.png', description: 'Nutrient-dense natural fertilizer.', sellerName: 'Pooja Rao', sellerLocation: 'Mysore, Karnataka', sellerRating: 4.4 },
    { id: 'fert7', name: 'Bone Meal', price: '₹35/kg', quantity: '250kg', type: 'sell', sellerId: 'farmer1', imageUrl: 'uploads/image-8.png', description: 'Phosphorus boost for root growth.', sellerName: 'Rohit Das', sellerLocation: 'Pune, Maharashtra', sellerRating: 4.2 },
    { id: 'fert8', name: 'Gypsum', price: '₹10/kg', quantity: '900kg', type: 'sell', sellerId: 'farmer2', imageUrl: 'uploads/image-8.png', description: 'Improves soil structure and calcium.', sellerName: 'Priya Nair', sellerLocation: 'Thiruvananthapuram, Kerala', sellerRating: 4.3 },
    { id: 'fert9', name: 'Zinc Sulphate', price: '₹65/kg', quantity: '120kg', type: 'sell', sellerId: 'farmer1', imageUrl: 'uploads/image-8.png', description: 'Micronutrient for yield improvement.', sellerName: 'Kiran Patel', sellerLocation: 'Surat, Gujarat', sellerRating: 4.5 },
    { id: 'fert10', name: 'Humic Acid', price: '₹70/kg', quantity: '80kg', type: 'sell', sellerId: 'farmer2', imageUrl: 'uploads/image-8.png', description: 'Enhances nutrient uptake.', sellerName: 'Lakshmi Devi', sellerLocation: 'Chennai, Tamil Nadu', sellerRating: 4.6 }
  ]
};

const canonicalizeServiceImages = (services) => ({
  ...services,
  tractors: (services.tractors || []).map((service, index) => ({
    ...service,
    serviceId: 'tractor-rentals',
    imageUrl: getServiceThumbnail('tractor-rentals').src,
    imageAlt: getServiceThumbnail('tractor-rentals').alt,
    demo: service.demo ?? /^tractor\d+$/.test(service.id),
    verificationStatus: service.verificationStatus || (index < 2 ? 'Verified' : index === 2 ? 'Pending Inspection' : 'Needs Information'),
    verified: service.verificationStatus === 'Verified' || (!service.verificationStatus && index < 2), brand:service.brand || (index % 2 ? 'Mahindra' : 'Sonalika'), model:service.model || service.name, manufacturingYear:service.manufacturingYear || 2022 + (index % 3), rentalUnit:service.rentalUnit || 'hour', serviceCondition:service.serviceCondition || 'Good', lastMaintenanceDate:service.lastMaintenanceDate || '2026-07-15'
  })),
  drones: (services.drones || []).map((service, index) => ({
    ...service,
    serviceId: 'drone-rentals',
    imageUrl: getServiceThumbnail('drone-rentals').src,
    imageAlt: getServiceThumbnail('drone-rentals').alt,
    demo: service.demo ?? /^drone\d+$/.test(service.id),
    verificationStatus: service.verificationStatus || (index < 2 ? 'Verified' : 'Pending Review'), verified:service.verificationStatus === 'Verified' || (!service.verificationStatus && index < 2), purpose:service.purpose || service.type || 'Spraying', coverage:service.coverage || '8 acres/day'
  })),
  fertilizers: (services.fertilizers || []).map((service, index) => ({
    ...service,
    serviceId: 'fertilizer-zone',
    imageUrl: getFertilizerVisual(service).src,
    imageAlt: getFertilizerVisual(service).alt,
    demo: service.demo ?? /^fert\d+$/.test(service.id),
    verificationStatus: service.verificationStatus || (index < 2 ? 'Verified' : index === 2 ? 'Pending Verification' : index === 3 ? 'Needs Documentation' : 'Verified'),
    verified:service.verificationStatus === 'Verified' || (!service.verificationStatus && (index < 2 || index > 3)), manufacturer:service.manufacturer || 'Demo Agri Inputs', batchNumber:service.batchNumber || `LOT-${String(index+1).padStart(3,'0')}`, manufacturingDate:service.manufacturingDate || '2026-01-15', expiryDate:service.expiryDate || '2027-12-31', certificationDocument:service.certificationDocument || ''
  }))
});

export const initializeStore = async () => {
  const storedUsers = read(KEYS.USERS).map(({ password, ...profile }) => profile);
  const mergedUsers = [...storedUsers];
  initialUsers.forEach(profile => {
    const index = mergedUsers.findIndex(user => user.id === profile.id || user.email === profile.email);
    if (index >= 0) mergedUsers[index] = { ...mergedUsers[index], ...profile };
    else mergedUsers.push(profile);
  });
  write(KEYS.USERS, mergedUsers);
  const existingProducts = read(KEYS.PRODUCTS);
  const catalogProducts = initialProducts.map(product => {
    const existing = existingProducts.find(item => item.id === product.id);
    return { ...product, ...(existing || {}) , imageUrl: product.imageUrl, imageAlt: product.imageAlt,
      name: product.name, price: product.price, unit: product.unit, description: product.description };
  });
  const seededIds = new Set(initialProducts.map(product => product.id));
  const farmerListings = existingProducts.filter(product => !seededIds.has(product.id));
  write(KEYS.PRODUCTS, [...catalogProducts, ...farmerListings]);
  const withDemoProducts = read(KEYS.PRODUCTS);
  demoProductRecords().forEach(product => { if (!withDemoProducts.some(item => item.id === product.id)) withDemoProducts.push(product); });
  write(KEYS.PRODUCTS, withDemoProducts);
  localStorage.setItem('kissan_catalog_version', CATALOG_VERSION);
  if (!localStorage.getItem(KEYS.AGRI_SERVICES)) write(KEYS.AGRI_SERVICES, canonicalizeServiceImages(initialAgriServices));
  else {
    const existing = JSON.parse(localStorage.getItem(KEYS.AGRI_SERVICES));
    const canonicalServices = canonicalizeServiceImages({ ...initialAgriServices, ...existing });
    if (!existing.fertilizers || existing.fertilizers.length < 8) {
      canonicalServices.fertilizers = canonicalizeServiceImages(initialAgriServices).fertilizers;
    }
    localStorage.setItem(KEYS.AGRI_SERVICES, JSON.stringify(canonicalServices));
  }
  if (!localStorage.getItem(KEYS.CONTACTS)) write(KEYS.CONTACTS, []);
  if (!sessionStorage.getItem(KEYS.CART)) sessionStorage.setItem(KEYS.CART, JSON.stringify([]));
  if (!localStorage.getItem(KEYS.W2C)) write(KEYS.W2C, demoWasteRecords());
  else {
    const existingWaste = read(KEYS.W2C);
    demoWasteRecords().forEach(record => { if (!existingWaste.some(item => item.id === record.id)) existingWaste.push(record); });
    write(KEYS.W2C, existingWaste);
  }
  if (!localStorage.getItem(KEYS.EARNINGS)) localStorage.setItem(KEYS.EARNINGS, JSON.stringify({}));
  if (!localStorage.getItem(KEYS.PAYMENTS)) localStorage.setItem(KEYS.PAYMENTS, JSON.stringify([]));
  if (!localStorage.getItem(KEYS.ORDERS)) write(KEYS.ORDERS, demoOrderRecords());
  initializeAdminData();

  const room = getRoom();
  if (room) {
    try {
      room.collection('product').subscribe((recList) => {
        const mapped = (recList || []).map(r => ({
          id: r.id, name: r.name, price: String(r.price), unit: r.unit,
          description: r.description, imageUrl: r.imageUrl, imageAlt: r.imageAlt || `${r.name} product`, farmerId: r.farmerId,
          quantity: r.quantity, location: r.location, images: r.images
        }));
        write(KEYS.PRODUCTS, mapped);
        window.dispatchEvent(new Event('products-updated'));
      });
    } catch (e) {}
  }
};
