from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Permite la conexión segura con el frontend de React

# BASADO EN EL ARTÍCULO: Sección 3.4 - Metodología de Clasificación de Depósitos
# Esta función categoriza el riesgo según el puntaje acumulado de los 11 criterios
def evaluar_clase_aragao(puntaje):
    if puntaje <= 250:
        return "Clase I", "Insignificante" # El artículo lo define como estable/seguro
    elif 251 <= puntaje <= 450:
        return "Clase II", "Bajo"
    elif 451 <= puntaje <= 750:
        return "Clase III", "Medio"
    else:
        return "Clase IV", "Alto"

@app.route('/calcular', methods=['POST'])
def calcular():
    data = request.json

    # --- 1. ANÁLISIS CUANTITATIVO (Norma NBR 13029) ---
    # Se captura el valor que el autor obtuvo mediante software (ej. 1.612)
    fs_input = data.get('fs_calculado')
    try:
        fs_calculado = float(fs_input) if fs_input else 0.0
    except ValueError:
        fs_calculado = 0.0

    # Valores de referencia citados en el artículo para depósitos de estériles
    FS_MINIMO_OPERACIONAL = 1.50 # Límite legal para estabilidad a largo plazo
    FS_CRITICO_ADMISIBLE = 1.30  # Límite tolerable en condiciones de lluvia extrema

    # Cálculo de la brecha de seguridad
    exceso = fs_calculado - FS_MINIMO_OPERACIONAL
    porcentaje_sobre_min = (exceso / FS_MINIMO_OPERACIONAL) * 100

    # --- 2. ANÁLISIS CUALITATIVO (Método Aragão) ---
    # Sumatoria de los 11 criterios técnicos (Altura, Sismicidad, etc.)
    puntajes = data.get('puntajes', [])
    total_puntaje = sum(int(p) for p in puntajes if str(p).strip() != "")

    # Obtención de la categoría de riesgo (Clase I a IV)
    clase, potencial = evaluar_clase_aragao(total_puntaje)

    # Respuesta estructurada para el reporte técnico
    return jsonify({
        "cuantitativa": {
            "valor_ingresado": fs_calculado,
            "fs_minimo": FS_MINIMO_OPERACIONAL,
            "exceso": round(exceso, 3),
            "porcentaje": f"{round(porcentaje_sobre_min, 2)}%",
            "cumple": fs_calculado >= FS_MINIMO_OPERACIONAL, # True si es >= 1.5
            "estado_critico": "Estable" if fs_calculado >= FS_CRITICO_ADMISIBLE else "Riesgo Alto"
        },
        "cualitativa": {
            "total": total_puntaje,
            "clase": clase,
            "potencial": potencial
        }
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)