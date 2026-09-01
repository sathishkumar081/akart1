// The canonical catalog used by the seeded marketplace and every product view.
// Farmer-created listings are stored separately and are merged by products.js.
export const PRODUCT_CATALOG = [
  ['prod1', 'Tomato', 40, 'kg', 'Farm-fresh red tomatoes.', 'assets/tomato.png', 'Fresh red tomatoes'],
  ['prod2', 'Potato', 30, 'kg', 'Organic potatoes, great for curries.', 'assets/potato.png', 'Fresh potatoes'],
  ['prod3', 'Onion', 40, 'kg', 'High-quality onions.', 'assets/onion.png', 'Fresh onions'],
  ['prod4', 'Carrot', 60, 'kg', 'Sweet and crunchy carrots.', 'assets/carrot.png', 'Fresh carrots'],
  ['prod5', 'Green Beans', 80, 'kg', 'Tender, crisp beans perfect for stir-fries.', 'assets/green-beans.png', 'Fresh green beans'],
  ['prod6', 'Spinach', 25, 'bunch', 'Organic spinach rich in iron and nutrients.', 'assets/spinach.png', 'Fresh spinach leaves'],
  ['prod7', 'Cauliflower', 50, 'kg', 'Fresh white cauliflower florets.', 'assets/cauliflower.png', 'Fresh cauliflower'],
  ['prod8', 'Cabbage', 40, 'kg', 'Leafy cabbage for salads and stir-fries.', 'assets/cabbage.png', 'Fresh cabbage'],
  ['prod9', 'Brinjal', 50, 'kg', 'Shiny purple brinjals, great for curries.', 'assets/brinjal.png', 'Fresh brinjal eggplants'],
  ['prod10', 'Ladyfinger', 60, 'kg', 'Crisp and fresh okra.', 'assets/ladyfinger.png', 'Fresh ladyfinger okra'],
  ['prod11', 'Rice', 70, 'kg', 'Premium long-grain rice.', 'assets/products/rice.svg', 'Long-grain rice'],
  ['prod12', 'Wheat', 35, 'kg', 'High-quality wheat grains.', 'assets/products/wheat.svg', 'Wheat grains'],
  ['prod13', 'Sugar', 45, 'kg', 'Refined sugar crystals.', 'assets/products/sugar.svg', 'White sugar crystals'],
  ['prod14', 'Milk', 60, 'L', 'Fresh dairy milk from local farms.', 'assets/products/milk.svg', 'Fresh milk bottle'],
  ['prod15', 'Eggs', 6, 'piece', 'Free-range eggs (per piece).', 'assets/products/eggs.svg', 'Farm fresh eggs'],
  ['prod16', 'Apples', 180, 'kg', 'Crisp and juicy apples.', 'assets/products/apples.svg', 'Fresh red apples'],
  ['prod17', 'Bananas', 60, 'dozen', 'Sweet ripe bananas.', 'assets/products/bananas.svg', 'Fresh yellow bananas'],
  ['prod18', 'Garlic', 120, 'kg', 'Aromatic garlic bulbs.', 'assets/products/garlic.svg', 'Fresh garlic bulbs'],
  ['prod19', 'Ginger', 140, 'kg', 'Fresh ginger roots.', 'assets/products/ginger.svg', 'Fresh ginger roots'],
  ['prod20', 'Chillies', 100, 'kg', 'Spicy green chillies.', 'assets/products/chillies.svg', 'Fresh green chillies']
].map(([id, name, price, unit, description, imageUrl, imageAlt], index) => ({
  id, name, price: String(price), unit, description, imageUrl, imageAlt,
  farmerId: index % 2 === 0 ? 'farmer1' : 'farmer2', status: 'Approved'
}));

export const catalogById = Object.fromEntries(PRODUCT_CATALOG.map(product => [product.id, product]));

