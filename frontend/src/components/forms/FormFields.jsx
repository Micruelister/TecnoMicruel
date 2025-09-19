


import styles from '../../pages/AuthForm.module.css';

// Este es nuestro componente reutilizable
// Usamos "desestructuración" para obtener las props que nos interesan
function FormField({ id, label, ...props }) {
  // `id` y `label` las usamos nosotros.
  // `...props` es un truco de JavaScript que agrupa TODAS las demás props
  // (como type, name, value, onChange, required, etc.) en un solo objeto.
  
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>
      {/* 
        El "spread operator" `{...props}` es la magia aquí.
        Es como decirle a React: "Toma todas las propiedades del objeto `props`
        y pásaselas directamente a este elemento <input>".
      */}
      <input id={id} className={styles.formInput} {...props} />
    </div>
  );
}

export default FormField;