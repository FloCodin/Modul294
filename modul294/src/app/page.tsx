'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

export default function HomePage() {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [filteredPokemons, setFilteredPokemons] = useState([]);

    // Mapping of Pokémon types to their respective colors
    const typeColors = {
        fire: '#F08030',
        water: '#6890F0',
        grass: '#78C850',
        electric: '#F8D030',
        psychic: '#F85888',
        ice: '#98D8D8',
        dragon: '#7038F8',
        dark: '#705848',
        fairy: '#EE99AC',
        normal: '#A8A878',
        fighting: '#C03028',
        flying: '#A890F0',
        poison: '#A040A0',
        ground: '#E0C068',
        rock: '#B8A038',
        bug: '#A8B820',
        ghost: '#705898',
        steel: '#B8B8D0',

    };

    // Fetch function to get Pokémon data based on selected types or offset
    const fetchPokemon = async (offset = 0, limit = 151) => {
        try {
            setLoading(true);
            let fetchedPokemons = [];

            // Fetch Pokémon by types if selected
            if (selectedTypes.length > 0) {
                // Fetch Pokémon for each selected type
                for (const type of selectedTypes) {
                    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    fetchedPokemons = [...fetchedPokemons, ...data.pokemon.map(p => p.pokemon)];
                }
                // Remove duplicates by Pokémon URL
                fetchedPokemons = Array.from(new Set(fetchedPokemons.map(p => p.url)))
                    .map(url => fetchedPokemons.find(p => p.url === url));
            } else {
                // Fetch default Pokémon set if no types are selected
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                fetchedPokemons = data.results;
            }

            // Fetch detailed data for each Pokémon
            const detailedPokemonPromises = fetchedPokemons.map(async (pokemon) => {
                const res = await fetch(pokemon.url);
                if (!res.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
                const detailedData = await res.json();

                // Fetch species data to get German names
                const speciesRes = await fetch(detailedData.species.url);
                if (!speciesRes.ok) throw new Error(`Failed to fetch species details for ${detailedData.name}`);
                const speciesData = await speciesRes.json();

                const germanName = speciesData.names.find(name => name.language.name === 'de')?.name || detailedData.name;

                const types = detailedData.types.map(typeInfo => typeInfo.type.name);

                return {
                    ...detailedData,
                    name: germanName,
                    types,
                };
            });

            const detailedPokemon = await Promise.all(detailedPokemonPromises);
            setPokemons(detailedPokemon);
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
            setError(error);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        // Fetch Pokémon whenever the selected types change
        setPokemons([]); // Clear current list to show only relevant Pokémon
        fetchPokemon(0, 151);
    }, [selectedTypes]); // Trigger fetch when selectedTypes changes

    // Update filteredPokemons based on the search input
    useEffect(() => {
        const filtered = pokemons.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(search.toLowerCase()) &&
            (selectedTypes.length === 0 || selectedTypes.every(type => pokemon.types.includes(type)))
        );
        setFilteredPokemons(filtered);
    }, [search, pokemons, selectedTypes]);

    const handleSearch = (e) => {
        setSearch(e.target.value.toLowerCase());
    };

    const handleTypeSelect = (type) => {
        // Toggle type selection, limit to 2 types
        setSelectedTypes(prevTypes => {
            if (prevTypes.includes(type)) {
                return prevTypes.filter(t => t !== type); // Remove type if already selected
            } else if (prevTypes.length < 2) {
                return [...prevTypes, type]; // Add type if less than 2 selected
            }
            return prevTypes; // Do nothing if 2 types are already selected
        });
    };

    const resetTypes = () => {
        setSelectedTypes([]); // Clear selected types
        setOffset(0); // Reset offset
        fetchPokemon(0, 151); // Fetch default Pokémon list
    };

    const loadMorePokemon = () => {
        setIsLoadingMore(true);
        setOffset(prevOffset => prevOffset + 100);
        fetchPokemon(offset + 100, 100);
    };

    return (
        <main className="p-6 relative">
            <iframe
                className="rounded-md mb-6"
                src="https://open.spotify.com/embed/track/4es7tZLsvmqc8kpyHOtHDI?utm_source=generator&theme=0"
                width="100%"
                height="252"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>

            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <h1 className="text-3xl font-bold mb-4 flex justify-center">Willkommen zu Flo's Pokedex</h1>

            <input
                type="text"
                placeholder="Search Pokemon by name"
                value={search}
                onChange={handleSearch}
                className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
            />

            <div className="flex flex-wrap gap-2 mb-4 justify-center pl-20 pr-20">
                {Object.keys(typeColors).map((type) => (
                    <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className={`px-2 py-1 rounded ${
                            selectedTypes.includes(type) ? 'ring-2 ring-offset-2 ring-white' : ''
                        }`}
                        style={{
                            backgroundColor: typeColors[type],
                            color: 'white',
                            textShadow: '0px 0px 2px black',
                            border: '1px solid black',
                            minWidth: '80px', // Setze die minimale Breite
                            maxWidth: '120px', // Optionale maximale Breite
                            textAlign: 'center',
                            cursor: 'pointer',
                        }}
                        disabled={selectedTypes.length >= 2 && !selectedTypes.includes(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            <div className="mb-4 flex items-center gap-4">
                <button
                    onClick={resetTypes}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Reset Types
                </button>
                <p className="text-lg">
                    Aktuelle Typen Suche: {selectedTypes.length > 0 ? selectedTypes.join(' und ') : 'Keine ausgewählt'}
                </p>
            </div>

            {loading && pokemons.length === 0 ? (
                <p className="text-center text-lg text-blue-500">Loading the Pokemon list...</p>
            ) : (
                <>
                    {search && filteredPokemons.length === 0 && (
                        <p className="text-center text-red-500">No results found for {search}</p>
                    )}
                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
                        {filteredPokemons.map((pokemon, index) => (
                            <li key={`${pokemon.id}-${index}`} className="text-center p-4 border rounded shadow">
                                <a href={`/pokemon/${pokemon.id}` } target="_blank" rel="noopener noreferrer">
                                    {pokemon.sprites.front_default ? (
                                        <Image
                                            src={pokemon.sprites.front_default}
                                            alt={pokemon.name}
                                            width={150}
                                            height={150}
                                            className="mx-auto mb-2"
                                        />
                                    ) : (
                                        <p className="text-center text-gray-500">No Image Available</p>
                                    )}
                                    <p className="text-lg capitalize">{pokemon.name}</p>
                                    <div className="flex justify-center gap-2 mt-2">
                                        {pokemon.types.map((type) => (
                                            <span
                                                key={type}
                                                className="px-2 py-1 rounded"
                                                style={{
                                                    backgroundColor: typeColors[type],
                                                    color: 'white',
                                                    textShadow: '0px 0px 2px black',
                                                    border: '1px solid black',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                    {pokemons.length > 0 && (
                        <div className="text-center mt-4">
                            <button
                                onClick={loadMorePokemon}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? 'Loading...' : 'Load More Pokémon'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
