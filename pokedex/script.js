const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const resetBtn = document.getElementById("reset-btn");

let allPokemon = [];
let currentFiltered = [];

async function getPokemonList() {
  try {
    const countRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1");
    const countData = await countRes.json();
    const total = countData.count || 0;

    const listRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=30&offset=0`,
    );
    const listData = await listRes.json();

    const urls = listData.results.map((r) => r.url);
    const batchSize = 50;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const promises = batch.map((u) => fetch(u).then((r) => r.json()));
      const results = await Promise.all(promises);
      allPokemon.push(...results);
    }

    populateTypeFilter();
    applyFilters();
  } catch (error) {
    console.error("Error fetching Pokemon:", error.message);
  }
}

function populateTypeFilter() {
  const typesSet = new Set();
  for (const p of allPokemon) {
    for (const t of p.types) typesSet.add(t.type.name);
  }
  const types = Array.from(typesSet).sort();
  for (const t of types) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    typeFilter.appendChild(opt);
  }
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  currentFiltered = allPokemon.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(q);
    const matchesType = type ? p.types.some((t) => t.type.name === type) : true;
    return matchesName && matchesType;
  });
  renderList(currentFiltered);
}

function renderList(list) {
  container.innerHTML = "";
  if (!list.length) {
    const msg = document.createElement("p");
    msg.className =
      "text-center text-slate-600 col-span-full font-medium text-lg";
    msg.textContent = "No Pokémon found.";
    container.appendChild(msg);
    return;
  }

  for (const pokemonData of list) {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer border border-slate-200 p-4";

    const types = pokemonData.types.map((t) => t.type.name).join(", ");

    card.innerHTML = `
      <div class="flex justify-center bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg p-4 mb-4 h-48">
        <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}" class="h-full w-auto object-contain">
      </div>
      <h2 class="text-2xl font-bold text-slate-800 capitalize text-center mb-2">${pokemonData.name}</h2>
      <div class="flex justify-center mb-4">
        <span class="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">#${pokemonData.id}</span>
      </div>
      <div class="border-t border-slate-200 pt-4">
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-slate-50 rounded p-3">
            <p class="text-slate-600 text-sm font-semibold">Height</p>
            <p class="text-slate-800 font-bold text-lg">${(pokemonData.height / 10).toFixed(1)} m</p>
          </div>
          <div class="bg-slate-50 rounded p-3">
            <p class="text-slate-600 text-sm font-semibold">Weight</p>
            <p class="text-slate-800 font-bold text-lg">${(pokemonData.weight / 10).toFixed(1)} kg</p>
          </div>
        </div>
        <div class="bg-slate-50 rounded p-3">
          <p class="text-slate-600 text-sm font-semibold mb-1">Type</p>
          <p class="text-slate-700 font-semibold capitalize">${types}</p>
        </div>
      </div>
    `;

    card.addEventListener("click", () => showDetailedCard(pokemonData));
    container.appendChild(card);
  }
}

function showDetailedCard(pokemonData) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "max-w-3xl mx-auto mt-4";

  const back = document.createElement("button");
  back.textContent = "← Back";
  back.className =
    "mb-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition";
  back.addEventListener("click", () => applyFilters());
  wrapper.appendChild(back);

  const detailCard = document.createElement("div");
  detailCard.className =
    "bg-white rounded-lg shadow-xl p-8 border border-slate-200";

  const types = pokemonData.types.map((t) => t.type.name).join(", ");
  const abilities = pokemonData.abilities.map((a) => a.ability.name).join(", ");
  const stats = pokemonData.stats
    .map(
      (s) =>
        `<li class="flex justify-between bg-slate-50 p-3 rounded border border-slate-200"><span class="font-semibold text-slate-700">${s.stat.name}:</span><span class="font-bold text-blue-600">${s.base_stat}</span></li>`,
    )
    .join("");

  detailCard.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1 flex justify-center">
        <div class="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-6 flex items-center justify-center h-64 w-64 border border-slate-200 shadow-md">
          <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}" class="h-full w-auto object-contain">
        </div>
      </div>
      <div class="flex-1">
        <h1 class="text-4xl font-bold text-slate-800 capitalize mb-2">${pokemonData.name}</h1>
        <p class="text-lg text-slate-600 mb-4 font-medium">#${pokemonData.id}</p>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-slate-50 rounded p-4 border border-slate-200">
            <p class="text-slate-600 text-sm font-semibold">Height</p>
            <p class="text-2xl font-bold text-slate-800">${(pokemonData.height / 10).toFixed(1)} m</p>
          </div>
          <div class="bg-slate-50 rounded p-4 border border-slate-200">
            <p class="text-slate-600 text-sm font-semibold">Weight</p>
            <p class="text-2xl font-bold text-slate-800">${(pokemonData.weight / 10).toFixed(1)} kg</p>
          </div>
        </div>
        
        <div class="mb-6">
          <p class="text-slate-700 text-sm font-semibold mb-2">Type</p>
          <div class="flex gap-2">
            ${pokemonData.types.map((t) => `<span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">${t.type.name}</span>`).join("")}
          </div>
        </div>
        
        <div class="mb-6">
          <p class="text-slate-700 text-sm font-semibold mb-2">Abilities</p>
          <p class="text-slate-700 capitalize font-medium bg-slate-50 p-3 rounded border border-slate-200">${abilities}</p>
        </div>
      </div>
    </div>
    
    <div class="border-t border-slate-200 mt-8 pt-8">
      <h2 class="text-2xl font-bold text-slate-800 mb-4">Stats</h2>
      <ul class="grid grid-cols-2 gap-3">
        ${stats}
      </ul>
    </div>
  `;

  wrapper.appendChild(detailCard);
  container.appendChild(wrapper);
}

searchInput.addEventListener("input", applyFilters);
typeFilter.addEventListener("change", applyFilters);
resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  typeFilter.value = "";
  applyFilters();
});

getPokemonList();
