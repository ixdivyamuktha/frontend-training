const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const resetBtn = document.getElementById("reset-btn");

let allPokemon = [];
let currentFiltered = [];

async function getPokemonList() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
    const data = await response.json();

    for (let pokemon of data.results) {
      const pokemonResponse = await fetch(pokemon.url);
      const pokemonData = await pokemonResponse.json();
      allPokemon.push(pokemonData);
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
    msg.className = "text-center text-gray-600 col-span-full";
    msg.textContent = "No Pokémon found.";
    container.appendChild(msg);
    return;
  }

  for (const pokemonData of list) {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer";

    const types = pokemonData.types.map((t) => t.type.name).join(", ");

    card.innerHTML = `
      <div class="flex justify-center bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg p-4 mb-4 h-48">
        <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}" class="h-full w-auto object-contain">
      </div>
      <h2 class="text-2xl font-bold text-gray-800 capitalize text-center mb-2">${pokemonData.name}</h2>
      <div class="flex justify-center mb-4">
        <span class="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">${pokemonData.id}</span>
      </div>
      <div class="border-t border-gray-200 pt-4">
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-gray-50 rounded p-3">
            <p class="text-gray-600 text-sm font-semibold">Height</p>
            <p class="text-gray-800 font-bold text-lg">${(pokemonData.height / 10).toFixed(1)} m</p>
          </div>
          <div class="bg-gray-50 rounded p-3">
            <p class="text-gray-600 text-sm font-semibold">Weight</p>
            <p class="text-gray-800 font-bold text-lg">${(pokemonData.weight / 10).toFixed(1)} kg</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded p-3">
          <p class="text-gray-600 text-sm font-semibold mb-1">Type</p>
          <p class="text-gray-800 font-bold capitalize">${types}</p>
        </div>
      </div>
    `;

    card.addEventListener("click", () => showRawJson(pokemonData));
    container.appendChild(card);
  }
}

function showRawJson(pokemonData) {
  container.innerHTML = "";
  const back = document.createElement("button");
  back.textContent = "Back";
  back.className = "mb-4 px-4 py-2 rounded bg-gray-200";
  back.addEventListener("click", () => applyFilters());

  const pre = document.createElement("pre");
  pre.className =
    "bg-white p-6 rounded shadow overflow-auto text-sm whitespace-pre-wrap";
  pre.textContent = JSON.stringify(pokemonData, null, 2);

  container.appendChild(back);
  container.appendChild(pre);
}

searchInput.addEventListener("input", applyFilters);
typeFilter.addEventListener("change", applyFilters);
resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  typeFilter.value = "";
  applyFilters();
});

getPokemonList();
