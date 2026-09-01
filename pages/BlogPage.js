const posts = [
  { id: 1, title: "10 Tips for Improving Soil Fertility Naturally", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=60", excerpt: "Improve soil health with simple organic methods.", cat: "Farming Tips" },
  { id: 2, title: "How Farm-to-Table is Changing the Way We Eat", img: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=60", excerpt: "Direct connections build trust and freshness.", cat: "Market Trends" },
  { id: 3, title: "The Future of Agri-Tech: Drones, IoT, and Smart Farming", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60", excerpt: "Technology is reshaping agriculture.", cat: "Agri-Tech" },
  { id: 4, title: "Farmer Success Story: From Small Farm to Big Profits", img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60", excerpt: "Inspiration from our community.", cat: "Success Stories" }
];
let page = 1; const perPage = 3;

function renderCards(list) {
  return list.map(p => `
    <article class="product-card" style="display:grid;grid-template-columns:120px 1fr;gap:1rem;align-items:center;margin-bottom:1rem;">
      <img src="${p.img}" alt="${p.title}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;background:#fff;">
      <div>
        <h3>${p.title}</h3>
        <small style="opacity:.9;">${p.cat}</small>
        <p style="margin:.4rem 0 0.6rem;">${p.excerpt}</p>
        <a href="#/blog" class="btn btn-secondary">Read More</a>
      </div>
    </article>`).join('');
}

export const render = () => `
<main>
  <div class="page-header"><h1>Blog & Articles</h1></div>
  <section class="ad-card" style="padding:1.25rem;">
    <div id="blog-list">${renderCards(posts.slice(0, perPage))}</div>
    <div style="text-align:center;margin-top:1rem;">
      <button id="load-more" class="btn btn-primary">Load More</button>
    </div>
  </section>
</main>
`;

export const addEventListeners = () => {
  const btn = document.getElementById('load-more');
  if (btn) {
    btn.addEventListener('click', () => {
      page++;
      const list = document.getElementById('blog-list');
      list.insertAdjacentHTML('beforeend', renderCards(posts.slice((page-1)*perPage, page*perPage)));
      if (page * perPage >= posts.length) btn.remove();
    });
  }
};