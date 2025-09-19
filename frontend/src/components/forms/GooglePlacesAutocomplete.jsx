// =================================================================
// FILE: GooglePlacesAutocomplete.jsx (OFFICIAL GOOGLE MIGRATION)
// =================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import styles from './GooglePlacesAutocomplete.module.css';


function GooglePlacesAutocomplete({ onSelect }) {
  // --- STATE MANAGEMENT ---
  
  // 'inputValue' es la "pizarra mágica" para el texto que el usuario está escribiendo.
  const [inputValue, setInputValue] = useState('');
  
  // 'suggestions' es la pizarra mágica para la lista de direcciones que Google nos devuelve.
  const [suggestions, setSuggestions] = useState([]);

  // --- API SERVICE ---

  // 'autocompleteService' es una "referencia" a la herramienta de autocompletado de Google.
  // Usamos useRef para que esta herramienta se cree una sola vez y no en cada renderizado.
  const autocompleteService = useRef(null);

  // EFECTO 1: Se ejecuta una sola vez cuando el componente se monta.
  // Su única misión es preparar la herramienta de Google cuando esté lista.
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, []); // El array vacío [] significa: "ejecútate solo una vez".

  // --- LOGIC FUNCTIONS ---

  // 'getSuggestions' es la función que habla con Google.
  // La envolvemos en useCallback para optimizarla, asegurando que no se recree innecesariamente.
  const getSuggestions = useCallback(async (value) => {
    // Si el texto está vacío o la herramienta de Google no está lista, limpiamos la lista y nos detenemos.
    if (value.trim() === '' || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    // Este es el "paquete" de información que le enviamos a Google.
    const request = {
      input: value,
    };
    
    // Usamos la nueva API moderna, que devuelve una "Promesa".
    // Esto nos permite usar la sintaxis limpia de async/await.
    try {
      const response = await autocompleteService.current.getPlacePredictions(request);
      setSuggestions(response.predictions || []);
    } catch (e) {
      console.error("Autocomplete prediction failed:", e);
      setSuggestions([]); // En caso de error, limpiamos las sugerencias.
    }
  }, []); // El array vacío [] significa que esta función en sí misma no cambia.

  // EFECTO 2: Este efecto es el "vigilante" que decide cuándo llamar a Google.
  useEffect(() => {
    // Creamos un temporizador.
    const handler = setTimeout(() => {
      // Cuando pasen 300ms, llamamos a la función para obtener sugerencias.
      getSuggestions(inputValue);
    }, 300); // Esto se llama "debounce".

    // Esta es una función de "limpieza". Se ejecuta si el usuario sigue escribiendo.
    // Cancela el temporizador anterior, evitando que se hagan llamadas innecesarias a la API.
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, getSuggestions]); // Se vuelve a ejecutar si el texto o la función cambian.


  // --- EVENT HANDLERS ---

  // Se ejecuta cuando el usuario selecciona un ítem de la lista.
  const handleSelect = (suggestion) => {
    setInputValue(suggestion.description); // Rellena el input con la dirección completa.
    setSuggestions([]); // Cierra la lista de sugerencias.
    onSelect(suggestion.place_id); // Envía el ID único del lugar al componente padre (CheckoutPage).
  };

  // --- RENDER LOGIC ---
  return (
    <div className={styles.container}>
      <Combobox value={''} onChange={handleSelect}>
        <ComboboxInput
          onChange={(event) => setInputValue(event.target.value)}
          value={inputValue} // Aseguramos que el input muestre nuestro estado
          placeholder="Start typing your address..."
          className={styles.input}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ComboboxOptions className={styles.suggestionList}>
            {suggestions.map((suggestion) => (
              <ComboboxOption
                key={suggestion.place_id}
                value={suggestion} // Pasamos el objeto completo a onChange
                className={({ active }) =>
                  `${styles.suggestionItem} ${active ? styles.activeItem : ''}`
                }
              >
                {suggestion.description}
              </ComboboxOption>
            ))}
             <div className={styles.googleLogoContainer}>
              <img 
                src="https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png" 
                alt="Powered by Google" 
                style={{height: '12px'}}
              />
            </div>
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
}

export default GooglePlacesAutocomplete;