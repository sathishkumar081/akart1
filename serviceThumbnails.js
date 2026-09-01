// Stable service-card image mapping. Keep IDs independent of card order.
export const SERVICE_THUMBNAILS = Object.freeze({
  'buy-fresh-produce': Object.freeze({ src: 'uploads/image-6.png', alt: 'Fresh farm produce' }),
  'post-an-ad': Object.freeze({ src: 'uploads/ChatGPT_Image_Aug_25__2026__10_00_15_PM.png', alt: 'Farmer posting an agricultural advertisement using a smartphone' }),
  'tractor-rentals': Object.freeze({ src: 'uploads/image-5.png', alt: 'Tractor working in an agricultural field' }),
  'drone-rentals': Object.freeze({ src: 'uploads/ChatGPT_Image_Aug_25__2026__10_01_34_PM.png', alt: 'Agricultural drone spraying crops' }),
  'fertilizer-zone': Object.freeze({ src: 'uploads/image-8.png', alt: 'Agricultural fertilizer and organic compost products' }),
  // Retained as a compatibility alias for the existing fertilizer-store route.
  'fertilizer-store': Object.freeze({ src: 'uploads/image-8.png', alt: 'Agricultural fertilizer and organic compost products' }),
  'waste-to-company': Object.freeze({ src: 'uploads/image-7.png', alt: 'Unsold agricultural produce being collected for sustainable reuse' })
});

export const getServiceThumbnail = (serviceId) => SERVICE_THUMBNAILS[serviceId];

// Fertilizer visuals are intentionally keyed by product ID, not card position.
// This prevents the marketplace from showing a tractor, crop, or a repeated
// generic visual when the catalogue order changes.
export const FERTILIZER_VISUALS = Object.freeze({
  fert1: Object.freeze({ src: 'assets/fertilizers/urea-granules.png', alt: 'Urea fertilizer granules in agricultural supply bags', category: 'Nitrogen fertilizer' }),
  fert2: Object.freeze({ src: 'assets/fertilizers/micronutrient-mix.png', alt: 'DAP fertilizer granules in agricultural supply packs', category: 'Phosphate fertilizer' }),
  fert3: Object.freeze({ src: 'assets/fertilizers/micronutrient-mix.png', alt: 'MOP potash fertilizer granules in agricultural supply packs', category: 'Potash fertilizer' }),
  fert4: Object.freeze({ src: 'assets/fertilizers/micronutrient-mix.png', alt: 'NPK nutrient fertilizer packs and granules', category: 'Balanced NPK fertilizer' }),
  fert5: Object.freeze({ src: 'assets/fertilizers/organic-compost.png', alt: 'Organic compost in a natural fertilizer pack', category: 'Organic compost' }),
  fert6: Object.freeze({ src: 'assets/fertilizers/organic-compost.png', alt: 'Vermicompost and earthworm-rich organic soil amendment', category: 'Organic vermicompost' }),
  fert7: Object.freeze({ src: 'assets/fertilizers/micronutrient-mix.png', alt: 'Bone meal soil nutrient pack', category: 'Organic soil nutrient' }),
  fert8: Object.freeze({ src: 'assets/fertilizers/micronutrient-mix.png', alt: 'Gypsum soil conditioner granules', category: 'Soil conditioner' }),
  fert9: Object.freeze({ src: 'assets/fertilizers/micronutrient-mix.png', alt: 'Zinc sulphate micronutrient fertilizer pack', category: 'Micronutrient' }),
  fert10: Object.freeze({ src: 'assets/fertilizers/liquid-biofertilizer.png', alt: 'Humic acid liquid bio-fertilizer bottles', category: 'Liquid bio-fertilizer' })
});

export const getFertilizerVisual = (fertilizer = {}) =>
  FERTILIZER_VISUALS[fertilizer.id]
  || { src: fertilizer.imageUrl || SERVICE_THUMBNAILS['fertilizer-zone'].src, alt: fertilizer.imageAlt || 'Agricultural fertilizer product', category: 'Agricultural input' };
