// =================================================================
// FILE: OpenStreetMapAutocomplete.jsx (REFACTORED FOR PHOTON API)
// =================================================================

import { useState, useEffect, useCallback } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import styles from './OpenStreetMapAutocomplete.module.css'; // Usaremos un nuevo CSS

function OpenStreetMapAutocomplete({ onSelect }) {
  // --- STATE MANAGEMENT ---
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // --- LOGIC FUNCTIONS ---

  // 'getSuggestions' ahora habla con el API de Photon (OpenStreetMap).
  const getSuggestions = useCallback(async (value) => {
    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    // Construimos la URL para la API de Photon.
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=5`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Transformamos la respuesta para que sea más fácil de usar.
      const formattedSuggestions = data.features.map(feature => {
        const props = feature.properties;
        return {
          id: props.osm_id, // Usamos un ID único de OpenStreetMap
          // Construimos una descripción legible.
          description: [props.name, props.street, props.city, props.country].filter(Boolean).join(', '),
          // Adjuntamos todos los detalles para uso posterior.
          details: {
            name: props.name,
            street: props.street,
            city: props.city,
            state: props.state,
            country: props.country,
            postcode: props.postcode,
          }
        };
      });
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Photon API request failed:", error);
      setSuggestions([]);
    }
  }, []);

  // EFECTO DEBOUNCE: Igual que antes, para no sobrecargar el API.
  useEffect(() => {
    const handler = setTimeout(() => {
      getSuggestions(inputValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, getSuggestions]);

  // --- EVENT HANDLERS ---

  // 'handleSelect' ahora es más simple.
  // Recibe el objeto completo de la sugerencia.
  const handleSelect = (suggestion) => {
    if (!suggestion) return;
    setInputValue(suggestion.description); // Rellenamos el input.
    setSuggestions([]); // Cerramos la lista.
    onSelect(suggestion.details); // Enviamos el objeto de detalles al padre (CheckoutPage).
  };

  // --- RENDER LOGIC ---
  return (
    <div className={styles.container}>
      <Combobox value={null} onChange={handleSelect}>
        <ComboboxInput
          onChange={(event) => setInputValue(event.target.value)}
          value={inputValue}
          placeholder="Start typing your address..."
          className={styles.input}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ComboboxOptions className={styles.suggestionList}>
            {suggestions.map((suggestion) => (
              <ComboboxOption
                key={suggestion.id}
                value={suggestion}
                className={({ active }) =>
                  `${styles.suggestionItem} ${active ? styles.activeItem : ''}`
                }
              >
                {suggestion.description}
              </ComboboxOption>
            ))}
            <div className={styles.osmLogoContainer}>
              <p>Address data © OpenStreetMap contributors</p>
            </div>
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
}

export default OpenStreetMapAutocomplete;
