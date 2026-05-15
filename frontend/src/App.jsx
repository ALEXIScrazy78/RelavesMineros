import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

// Definición de los 11 criterios técnicos del Método de Aragão & Oliveira (2011)
// Estos datos coinciden con la tabla de inspección cualitativa del artículo.
const CRITERIOS_ARAGAO = [
  { id: 1, nombre: "Altura del depósito", desc: "Menor a 50 m" },
  { id: 2, nombre: "Volumen del depósito", desc: "Menor a 1*10^6 m3 por banco" },
  { id: 3, nombre: "Inclinación del talud", desc: "Entre 26° y 35°" },
  { id: 4, nombre: "Pendiente de la fundación", desc: "Aproximadamente 10°" },
  { id: 5, nombre: "Confinamiento", desc: "Presencia de bancas o terrazas naturales" },
  { id: 6, nombre: "Condición de la fundación", desc: "Resistencia del suelo de apoyo" },
  { id: 7, nombre: "Calidad del material", desc: "Resistencia y granulometría de los estériles" },
  { id: 8, nombre: "Método constructivo", desc: "Construcción por bancos o capas" },
  { id: 9, nombre: "Tasa de disposición", desc: "Velocidad de avance del banco" },
  { id: 10, nombre: "Sismicidad", desc: "Riesgo sísmica de la zona" },
  { id: 11, nombre: "Condiciones piezométricas", desc: "Presencia de agua y presiones de poros" }
];

function App() {
  // Estados para manejar los datos del formulario y los resultados del backend
  const [fsCalculado, setFsCalculado] = useState("");
  const [puntajes, setPuntajes] = useState(new Array(11).fill(0)); // Inicia con 0 (Favorable)
  const [resultado, setResultado] = useState(null);

  // Función para enviar los datos al servidor en la nube (Render)
  const realizarCalculo = async () => {
    if (!fsCalculado) return alert("Ingrese el Factor de Seguridad (FS)");
    try {
      // Conexión con el API de Flask para procesar NBR 13029 y Aragão
      const resp = await axios.post('https://relavesminerosback.onrender.com/calcular', {
        fs_calculado: fsCalculado,
        puntajes: puntajes
      });
      setResultado(resp.data); // Guarda la respuesta con los cálculos de exceso y clase
    } catch (err) {
      alert("Error de conexión con el servidor de cálculo.");
    }
  };

  return (
    <div className="main-container">
      <header className="header-mining">
        <h1>Evaluación Geotécnica de Depósito de Relaves</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        
        {/* SECCIÓN 1: ENTRADA DE DATOS TÉCNICOS */}
        <div>
          {/* Bloque Cuantitativo: Basado en resultados de software de equilibrio límite */}
          <div className="mining-card" style={{ marginBottom: '20px' }}>
            <h3>1. Análisis Cuantitativo (NBR 13029)</h3>
            <label>Factor de Seguridad Calculado (FS):</label>
            <input 
              type="number" 
              className="input-field"
              value={fsCalculado} 
              min="0.1" max="10" step="0.001"
              onChange={(e) => {
                const val = e.target.value;
                // Validación para evitar valores ilógicos en geotecnia
                if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
                  setFsCalculado(val);
                }
              }}
              placeholder="Ej: 1.612"
            />
          </div>

          {/* Bloque Cualitativo: Selección de condiciones de campo */}
          <div className="mining-card">
            <h3>2. Clasificación Cualitativa (Aragão)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {CRITERIOS_ARAGAO.map((item, index) => (
                <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.nombre}</div>
                  <select 
                    className="input-field" 
                    value={puntajes[index]} // Componente controlado para no perder datos
                    onChange={(e) => {
                      const n = [...puntajes];
                      n[index] = parseInt(e.target.value);
                      setPuntajes(n);
                    }}
                  >
                    <option value="0">0 - Favorable</option>
                    <option value="50">50 - Moderado</option>
                    <option value="100">100 - Crítico</option>
                  </select>
                </div>
              ))}
            </div>
            <button className="mining-button" onClick={realizarCalculo}>
              Ejecutar Evaluación Técnica
            </button>
          </div>
        </div>

        {/* SECCIÓN 2: REPORTE DE RESULTADOS (Panel Lateral) */}
        <div>
          {resultado ? (
            <div style={{ position: 'sticky', top: '20px' }}>
              {/* Resultado de Estabilidad Estructural */}
              <div className="result-box result-nbr">
                <small>NORMA NBR 13029</small>
                <h2>{resultado.cuantitativa.cumple ? "APROBADO" : "RECHAZADO"}</h2>
                <p>Exceso: {resultado.cuantitativa.exceso}</p>
                <p>Seguridad adicional: {resultado.cuantitativa.porcentaje}</p>
              </div>

              {/* Resultado de Riesgo Cualitativo */}
              <div className="result-box result-aragao">
                <small>CLASIFICACIÓN ARAGÃO</small>
                <h2>{resultado.cualitativa.clase}</h2>
                <p>Puntaje Total: {resultado.cualitativa.total} pts</p>
                <p>Riesgo: <strong>{resultado.cualitativa.potencial}</strong></p>
              </div>
            </div>
          ) : (
            <div className="empty-results">
              Esperando datos para generar reporte...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;