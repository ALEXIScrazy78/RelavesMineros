import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Asegúrate de importar el CSS

const CRITERIOS_ARAGAO = [
  { id: 1, nombre: "Altura del depósito", desc: "Menor a 50 m" },
  { id: 2, nombre: "Volumen del depósito", desc: "Menor a 1*10^6 m3 por banco" },
  { id: 3, nombre: "Inclinación del talud", desc: "Entre 26° y 35°" },
  { id: 4, nombre: "Pendiente de la fundación", desc: "Aproximadamente 10°" },
  { id: 5, nombre: "Confinamiento", desc: "Presencia de bancas/terrazas o disposición en laderas" },
  { id: 6, nombre: "Condición de la fundación", desc: "Resistencia igual o mayor al depósito" },
  { id: 7, nombre: "Calidad del material", desc: "Resistencia moderada y durabilidad variable" },
  { id: 8, nombre: "Método constructivo", desc: "Construcción ascendente por bancos (< 25m)" },
  { id: 9, nombre: "Tasa de disposición", desc: "Avance del banco menor a 0.1 m por día" },
  { id: 10, nombre: "Sismicidad", desc: "Actividad sísmica de la zona (Baja)" },
  { id: 11, nombre: "Condiciones piezométricas", desc: "Presiones de poros e infiltración mínima" }
];

function App() {
  const [fsCalculado, setFsCalculado] = useState("");
  const [puntajes, setPuntajes] = useState(new Array(11).fill(0));
  const [resultado, setResultado] = useState(null);

  const realizarCalculo = async () => {
    if (!fsCalculado) return alert("Ingrese el FS");
    try {
      const resp = await axios.post('https://relavesminerosback.onrender.com/calcular', {
        fs_calculado: fsCalculado,
        puntajes: puntajes
      });
      setResultado(resp.data);
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
        
        {/* ENTRADA DE DATOS */}
        <div>

          <div className="mining-card" style={{ marginBottom: '20px' }}>
            <h3>1. Análisis Cuantitativo (NBR 13029)</h3>
            <label>Factor de Seguridad Calculado:</label>
            <input 
              type="number" 
              className="input-field"
              value={fsCalculado} 
              // Añadimos límites físicos y normativos
              min="0.1"
              max="10"
              step="0.001"
              onChange={(e) => {
                const val = e.target.value;
                // Validación básica para que no escriban números negativos manualmente
                if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
                  setFsCalculado(val);
                }
              }}
              placeholder="Ej: 1.612"
            />
            <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
              * Rango técnico permitido: 0.1 - 10.0
            </p>
          </div>

          <div className="mining-card">
            <h3>2. Clasificación Cualitativa (Aragão)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {CRITERIOS_ARAGAO.map((item, index) => (
                <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.nombre}</div>
                  <select 
                    className="input-field" 
                    style={{ padding: '5px' }}
                    value={puntajes[index]}
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
            <button className="mining-button" style={{ marginTop: '20px', width: '100%' }} onClick={realizarCalculo}>
              Ejecutar Evaluación Técnica
            </button>
          </div>
        </div>

        {/* PANEL DE RESULTADOS */}
        <div>
          {resultado ? (
            <div style={{ position: 'sticky', top: '20px' }}>
              <div className="result-box result-nbr" style={{ marginBottom: '15px' }}>
                <small>NORMA NBR 13029</small>
                <h2>{resultado.cuantitativa.cumple ? "APROBADO" : "RECHAZADO"}</h2>
                <p>Exceso: {resultado.cuantitativa.exceso}</p>
                <p>Relación: {resultado.cuantitativa.porcentaje}</p>
              </div>

              <div className="result-box result-aragao">
                <small>CLASIFICACIÓN ARAGÃO</small>
                <h2>{resultado.cualitativa.clase}</h2>
                <p>Puntaje: {resultado.cualitativa.total} pts</p>
                <p>Riesgo: <strong>{resultado.cualitativa.potencial}</strong></p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #ccc', color: '#999' }}>
              Esperando ingreso de datos para generar reporte...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;