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


@app.route("/")
def home():
    return {"message": "Backend funcionando"}


@app.route('/calcular', methods=['POST'])
def calcular():
    data = request.json

    # FS calculado
    fs_input = data.get('fs_calculado')

    try:
        fs_calculado = float(fs_input) if fs_input else 0.0
    except ValueError:
        fs_calculado = 0.0

    FS_MINIMO_OPERACIONAL = 1.50
    FS_CRITICO_ADMISIBLE = 1.30

    exceso = fs_calculado - FS_MINIMO_OPERACIONAL
    porcentaje_sobre_min = (exceso / FS_MINIMO_OPERACIONAL) * 100

    # Puntajes cualitativos
    puntajes = data.get('puntajes', [])

    total_puntaje = sum(
        int(p) for p in puntajes
        if str(p).strip() != ""
    )

    clase, potencial = evaluar_clase_aragao(total_puntaje)

    return jsonify({
        "cuantitativa": {
            "valor_ingresado": fs_calculado,
            "fs_minimo": FS_MINIMO_OPERACIONAL,
            "exceso": round(exceso, 3),
            "porcentaje": f"{round(porcentaje_sobre_min, 2)}%",
            "cumple": fs_calculado >= FS_MINIMO_OPERACIONAL,
            "estado_critico": "Estable" if fs_calculado >= FS_CRITICO_ADMISIBLE else "Riesgo Alto"
        },
        "cualitativa": {
            "total": total_puntaje,
            "clase": clase,
            "potencial": potencial
        }
    })


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)