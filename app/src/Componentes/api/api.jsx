import React, { useState, useEffect } from "react";

// Datos nutricionales simulados (valores por 100 gramos)
const datosNutricionales = {
  Tomato: { calorias: 18, proteinas: 0.9, grasas: 0.2, carbohidratos: 3.9 },
  Chicken: { calorias: 165, proteinas: 31, grasas: 3.6, carbohidratos: 0 },
  Rice: { calorias: 130, proteinas: 2.7, grasas: 0.3, carbohidratos: 28.2 },
  Potato: { calorias: 77, proteinas: 2, grasas: 0.1, carbohidratos: 17 },
};

const Api = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [filteredIngredientes, setFilteredIngredientes] = useState([]);
  const [selectedIngredientes, setSelectedIngredientes] = useState([]);
  const [recetasGuardadas, setRecetasGuardadas] = useState([]);
  const [nombreReceta, setNombreReceta] = useState("");
  const [editandoReceta, setEditandoReceta] = useState(null);

  // Obtener lista de ingredientes
  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
      .then((respuesta) => respuesta.json())
      .then((data) => {
        if (data.meals) {
          setIngredientes(data.meals);
          setFilteredIngredientes(data.meals);
        }
      })
      .catch((error) => console.error("Error al obtener los ingredientes:", error));
  }, []);

  const handleAgregarIngrediente = (nombre) => {
    if (!nombre) return;

    const nuevoIngrediente = {
      nombre,
      cantidad: 0,
      unidad: "g",
      nutricion: null,
    };

    setSelectedIngredientes([...selectedIngredientes, nuevoIngrediente]);
  };

  const handleCantidadChange = (index, valor, tipo) => {
    const nuevosIngredientes = [...selectedIngredientes];
    nuevosIngredientes[index][tipo] = valor;

    const ingredienteInfo = datosNutricionales[nuevosIngredientes[index].nombre];
    if (ingredienteInfo && nuevosIngredientes[index].cantidad > 0) {
      const factor = nuevosIngredientes[index].cantidad / 100;
      nuevosIngredientes[index].nutricion = {
        calorias: (ingredienteInfo.calorias * factor).toFixed(2),
        proteinas: (ingredienteInfo.proteinas * factor).toFixed(2),
        grasas: (ingredienteInfo.grasas * factor).toFixed(2),
        carbohidratos: (ingredienteInfo.carbohidratos * factor).toFixed(2),
      };
    }

    setSelectedIngredientes(nuevosIngredientes);
  };

  const handleEliminarIngrediente = (index) => {
    setSelectedIngredientes(selectedIngredientes.filter((_, i) => i !== index));
  };

  const handleGuardarReceta = () => {
    if (!nombreReceta || selectedIngredientes.length === 0) {
      alert("Ingrese un nombre para la receta y al menos un ingrediente.");
      return;
    }

    const totalNutricion = selectedIngredientes.reduce(
      (totales, ingrediente) => {
        if (ingrediente.nutricion) {
          totales.calorias += parseFloat(ingrediente.nutricion.calorias);
          totales.proteinas += parseFloat(ingrediente.nutricion.proteinas);
          totales.grasas += parseFloat(ingrediente.nutricion.grasas);
          totales.carbohidratos += parseFloat(ingrediente.nutricion.carbohidratos);
        }
        return totales;
      },
      { calorias: 0, proteinas: 0, grasas: 0, carbohidratos: 0 }
    );

    const nuevaReceta = {
      id: editandoReceta ? editandoReceta.id : Date.now(),
      nombre: nombreReceta,
      ingredientes: selectedIngredientes,
      nutricion: totalNutricion,
    };

    if (editandoReceta) {
      setRecetasGuardadas(
        recetasGuardadas.map((receta) =>
          receta.id === editandoReceta.id ? nuevaReceta : receta
        )
      );
      setEditandoReceta(null);
    } else {
      setRecetasGuardadas([...recetasGuardadas, nuevaReceta]);
    }

    setNombreReceta("");
    setSelectedIngredientes([]);
  };

  const handleEditarReceta = (receta) => {
    setNombreReceta(receta.nombre);
    setSelectedIngredientes(receta.ingredientes);
    setEditandoReceta(receta);
  };

  const handleEliminarReceta = (id) => {
    setRecetasGuardadas(recetasGuardadas.filter((receta) => receta.id !== id));
  };

  return (
    <section className="container-api">
      <div className="container">
        <h1>{editandoReceta ? "Edita tu receta" : "Crea una nueva receta"}</h1>

        <div className="nombre-receta">
          <label>Nombre de la receta:</label>
          <input
            type="text"
            value={nombreReceta}
            onChange={(e) => setNombreReceta(e.target.value)}
            placeholder="Ingresa el nombre de la receta"
          />
        </div>

        <div className="buscar-ingredientes">
          <label>Buscar ingredientes:</label>
          <select onChange={(e) => handleAgregarIngrediente(e.target.value)}>
            <option value="">Selecciona un ingrediente</option>
            {filteredIngredientes.map((ingrediente) => (
              <option key={ingrediente.idIngredient} value={ingrediente.strIngredient}>
                {ingrediente.strIngredient}
              </option>
            ))}
          </select>
        </div>

        
        <div className="container-seleccionados">
        <h4>Ingredientes seleccionados:</h4>
        {selectedIngredientes.map((ingrediente, index) => (
          <div key={index} className="ingredientes-seleccionados">
            
            <strong>{ingrediente.nombre}</strong>
  
            
            <input
              type="number"
              placeholder="Cantidad"
              value={ingrediente.cantidad}
              onChange={(e) => handleCantidadChange(index, e.target.value, "cantidad")}
            />
            
            <select
              value={ingrediente.unidad}
              onChange={(e) => handleCantidadChange(index, e.target.value, "unidad")}
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
            </select>
            <button type="button" onClick={() => handleEliminarIngrediente(index)}>
              Eliminar
            </button>
          </div>
          
          
        ))}      
        </div>

        <div className="guardarreceta-container">
        <button className="button-guardar" type="button" onClick={handleGuardarReceta}>
          {editandoReceta ? "Guardar Cambios" : "Guardar Receta"}
        </button>
        </div>

  <div className="recetas-guardadas-container">
    <h2>
      {recetasGuardadas.length === 0
        ? "No hay recetas guardadas"
        : "Recetas Guardadas"}
    </h2>
    {recetasGuardadas.length > 0 &&
      recetasGuardadas.map((receta) => (
        <div key={receta.id} className="receta-guardada">
          <div className="receta-header">
            <h3>{receta.nombre}</h3>
            <div className="receta-button">
              <button onClick={() => handleEditarReceta(receta)}>Editar</button>
              <button onClick={() => handleEliminarReceta(receta.id)}>Eliminar</button>
            </div>
          </div>
          <ul className="receta-info">
            {receta.ingredientes.map((ingrediente, index) => (
              <li key={index}>
                {ingrediente.nombre} - {ingrediente.cantidad} {ingrediente.unidad} |{" "}
                <span>
                  Calorías: {ingrediente.nutricion?.calorias || "N/A"} kcal, Proteínas:{" "}
                  {ingrediente.nutricion?.proteinas || "N/A"} g, Grasas:{" "}
                  {ingrediente.nutricion?.grasas || "N/A"} g, Carbohidratos:{" "}
                  {ingrediente.nutricion?.carbohidratos || "N/A"} g
                </span>
              </li>
            ))}
          </ul>
          <div className="receta-nutricional">
            <strong>Información Nutricional Total:</strong>
            <p>
              Calorías: {receta.nutricion.calorias.toFixed(2)} kcal | Proteínas:{" "}
              {receta.nutricion.proteinas.toFixed(2)} g | Grasas:{" "}
              {receta.nutricion.grasas.toFixed(2)} g | Carbohidratos:{" "}
              {receta.nutricion.carbohidratos.toFixed(2)} g
            </p>
          </div>
        </div>
      ))}
</div>


      </div>
    </section>
    
  );
};

export default Api;































// import React, { useState, useEffect } from "react";

// // Datos nutricionales simulados (valores por 100 gramos)
// const datosNutricionales = {
//   Tomato: { calorias: 18, proteinas: 0.9, grasas: 0.2, carbohidratos: 3.9 },
//   Chicken: { calorias: 165, proteinas: 31, grasas: 3.6, carbohidratos: 0 },
//   Rice: { calorias: 130, proteinas: 2.7, grasas: 0.3, carbohidratos: 28.2 },
//   Potato: { calorias: 77, proteinas: 2, grasas: 0.1, carbohidratos: 17 },
// };

// const Api = () => {
//   const [ingredientes, setIngredientes] = useState([]);
//   const [filteredIngredientes, setFilteredIngredientes] = useState([]);
//   const [busqueda, setBusqueda] = useState("");
//   const [selectedIngredientes, setSelectedIngredientes] = useState([]);
//   const [recetaGuardada, setRecetaGuardada] = useState(null);
//   const [nombreReceta, setNombreReceta] = useState("");

//   // Obtener lista de ingredientes
//   useEffect(() => {
//     fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
//       .then((respuesta) => respuesta.json())
//       .then((data) => {
//         if (data.meals) {
//           setIngredientes(data.meals);
//           setFilteredIngredientes(data.meals);
//         }
//       })
//       .catch((error) => console.error("Error al obtener los ingredientes:", error));
//   }, []);

//   // Filtrar ingredientes
//   const handleBusquedaChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setBusqueda(query);
//     setFilteredIngredientes(
//       ingredientes.filter((ingrediente) =>
//         ingrediente.strIngredient.toLowerCase().includes(query)
//       )
//     );
//   };

//   // Agregar ingrediente
//   const handleAgregarIngrediente = (nombre) => {
//     if (!nombre) return;

//     const nuevoIngrediente = {
//       nombre,
//       cantidad: 0,
//       unidad: "g",
//       nutricion: null,
//     };

//     setSelectedIngredientes([...selectedIngredientes, nuevoIngrediente]);
//   };

//   // Actualizar cantidad/unidad y calcular nutrición
//   const handleCantidadChange = (index, valor, tipo) => {
//     const nuevosIngredientes = [...selectedIngredientes];
//     nuevosIngredientes[index][tipo] = valor;

//     // Calcular nutrición
//     const ingredienteInfo = datosNutricionales[nuevosIngredientes[index].nombre];
//     if (ingredienteInfo && nuevosIngredientes[index].cantidad > 0) {
//       const factor = nuevosIngredientes[index].cantidad / 100;
//       nuevosIngredientes[index].nutricion = {
//         calorias: (ingredienteInfo.calorias * factor).toFixed(2),
//         proteinas: (ingredienteInfo.proteinas * factor).toFixed(2),
//         grasas: (ingredienteInfo.grasas * factor).toFixed(2),
//         carbohidratos: (ingredienteInfo.carbohidratos * factor).toFixed(2),
//       };
//     }

//     setSelectedIngredientes(nuevosIngredientes);
//   };

//   // Eliminar ingrediente
//   const handleEliminarIngrediente = (index) => {
//     setSelectedIngredientes(selectedIngredientes.filter((_, i) => i !== index));
//   };

//   // Guardar la receta
//   const handleGuardarReceta = () => {
//     if (!nombreReceta || selectedIngredientes.length === 0) {
//       alert("Por favor ingresa un nombre y al menos un ingrediente para la receta.");
//       return;
//     }
//     setRecetaGuardada({
//       nombre: nombreReceta,
//       ingredientes: selectedIngredientes,
//     });
//     setNombreReceta("");
//     setSelectedIngredientes([]);
//     alert("Receta guardada con éxito");
//   };

//   return (
//     <section className="container-api">
//       <div className="container">
//       <div>
//       <h1>Crea una nueva receta</h1>

//       {/* Nombre de la receta */}
//       <div className="nombre-receta">
//         <label>Nombre de la receta :</label>
//         <input
//           type="text"
//           value={nombreReceta}
//           onChange={(e) => setNombreReceta(e.target.value)}
//           placeholder="Ingresa el nombre de la receta"
//         />
//       </div>

//       {/* Búsqueda de ingredientes */}
//       <div className="buscar-ingredientes">
//         <label>Buscar ingredientes :</label>
//         <select onChange={(e) => handleAgregarIngrediente(e.target.value)}>
//           <option value="">Selecciona un ingrediente</option>
//           {filteredIngredientes.map((ingrediente) => (
//             <option key={ingrediente.idIngredient} value={ingrediente.strIngredient}>
//               {ingrediente.strIngredient}
//             </option>
//           ))}
//         </select>

//       </div>

//       {/* Ingredientes seleccionados */}
      
//       <h4>Ingredientes seleccionados :</h4>
//       {selectedIngredientes.map((ingrediente, index) => (
//         <div key={index} className="ingredientes-seleccionados">
//           <strong>{ingrediente.nombre}</strong>
//           <input
//             type="number"
//             placeholder="Cantidad"
//             value={ingrediente.cantidad}
//             onChange={(e) => handleCantidadChange(index, e.target.value, "cantidad")}
//             min="1"
//           />
          
//           <select
//             value={ingrediente.unidad}
//             onChange={(e) => handleCantidadChange(index, e.target.value, "unidad")}
//           >
//             <option value="g">g</option>
//             <option value="ml">ml</option>
//           </select>
//           <button type="button" onClick={() => handleEliminarIngrediente(index)}>
//             Eliminar
//           </button>
        
//           {/* Información nutricional */}
//           {ingrediente.nutricion && (
//             <div>
//               <em>Información Nutricional:</em>
//               <p>
//                 Calorías: {ingrediente.nutricion.calorias} kcal | Proteínas:{" "}
//                 {ingrediente.nutricion.proteinas} g | Grasas: {ingrediente.nutricion.grasas}{" "}
//                 g | Carbohidratos: {ingrediente.nutricion.carbohidratos} g
//               </p>
//             </div>
//           )}
          
//         </div>
//       ))}

//       {/* Botón para guardar receta */}
//       <button type="button" onClick={handleGuardarReceta}>
//         Guardar Receta
//       </button>
      
//       {/* Mostrar receta guardada */}
//       {recetaGuardada && (
//         <div>
//           <h2>Receta Guardada</h2>
//           <p>
//             <strong>Nombre:</strong> {recetaGuardada.nombre}
//           </p>
//           <h3>Ingredientes:</h3>
//           <ul>
//             {recetaGuardada.ingredientes.map((ingrediente, index) => (
//               <li key={index}>
//                 {ingrediente.nombre} - {ingrediente.cantidad} {ingrediente.unidad} | Calorías:{" "}
//                 {ingrediente.nutricion?.calorias || "N/A"} kcal
//               </li>
//             ))}
//           </ul>
//         </div>
      
//       )}
      
//     </div>
//     </div>
//     </section>
//   );
// };

// export default Api;






