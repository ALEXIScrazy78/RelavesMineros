from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def evaluar_clase_aragao(puntaje):
    if puntaje <= 250:
        return "Clase I", "Despreciable"
    elif 251 <= puntaje <= 450:
        return "Clase II", "Bajo"
    elif 451 <= puntaje <= 750:
        return "Clase III", "Medio"
    else:
        return "Clase IV", "Alto"

@app.route('/calcular', methods=['POST'])
def calcular():
    data = request.json
    
    # --- Variable Cuantitativa ---
    # Validamos que el dato no sea una cadena vacía antes de convertirlo
    fs_input = data.get('fs_calculado')
    try:
        fs_calc = float(fs_input) if fs_input and str(fs_input).strip() != "" else 0.0
    except ValueError:
        fs_calc = 0.0
    
    fs_minimo = 1.50
    
    exceso = fs_calc - fs_minimo
    porcentaje_sobre_min = (exceso / fs_minimo) * 100

    # En app.py, dentro de la función calcular:

    fs_calculado = float(data.get('fs_calculado', 0))

    # Límites según NBR 13029 citada en el artículo
    FS_MINIMO_OPERACIONAL = 1.50 
    FS_CRITICO_ADMISIBLE = 1.30

    # El "Exceso de Seguridad" que pediste
    exceso = fs_calculado - FS_MINIMO_OPERACIONAL
    # El porcentaje sobre el mínimo
    porcentaje_sobre_min = (exceso / FS_MINIMO_OPERACIONAL) * 100

    resultado_cuantitativo = {
        "valor_ingresado": fs_calculado,
        "exceso": round(exceso, 3),
        "porcentaje": f"{round(porcentaje_sobre_min, 2)}%",
        "cumple_norma": fs_calculado >= FS_MINIMO_OPERACIONAL,
        "estado_critico": "Estable" if fs_calculado >= FS_CRITICO_ADMISIBLE else "Riesgo Alto"
    }

    # --- Variable Cualitativa (Aragão) ---
    puntajes = data.get('puntajes', [])
    total_puntaje = sum(map(int, puntajes))
    clase, potencial = evaluar_clase_aragao(total_puntaje)

    return jsonify({
        "cuantitativa": {
            "fs_minimo": fs_minimo,
            "exceso": round(exceso, 3),
            "porcentaje": f"{round(porcentaje_sobre_min, 2)}%",
            "cumple": fs_calc >= fs_minimo
        },
        "cualitativa": {
            "total": total_puntaje,
            "clase": clase,
            "potencial": potencial
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)