ROWS = 6
COLUMNS = 7

def crear_tablero():
    return [[' ' for _ in range(COLUMNS)] for _ in range(ROWS)]

def imprimir_tablero(tablero):
    # Imprime de arriba hacia abajo (visual típico)
    print()
    for fila in tablero:
        print('| ' + ' | '.join(fila) + ' |')
    print('  ' + '   '.join(str(i+1) for i in range(COLUMNS)))  # números de columnas
    print()

def columna_valida(tablero, col):
    return 0 <= col < COLUMNS and tablero[0][col] == ' '

def fila_libre(tablero, col):
    # retorna la última fila libre (desde abajo)
    for r in range(ROWS-1, -1, -1):
        if tablero[r][col] == ' ':
            return r
    return None

def colocar_ficha(tablero, fila, col, ficha):
    tablero[fila][col] = ficha

def tablero_lleno(tablero):
    return all(tablero[0][c] != ' ' for c in range(COLUMNS))

def hay_victoria(tablero, ficha):
    # Horizontal
    for r in range(ROWS):
        for c in range(COLUMNS - 3):
            if all(tablero[r][c+i] == ficha for i in range(4)):
                return True
    # Vertical
    for c in range(COLUMNS):
        for r in range(ROWS - 3):
            if all(tablero[r+i][c] == ficha for i in range(4)):
                return True
    # Diagonal derecha-abajo (\)
    for r in range(ROWS - 3):
        for c in range(COLUMNS - 3):
            if all(tablero[r+i][c+i] == ficha for i in range(4)):
                return True
    # Diagonal izquierda-abajo (/)
    for r in range(ROWS - 3):
        for c in range(3, COLUMNS):
            if all(tablero[r+i][c-i] == ficha for i in range(4)):
                return True
    return False

def pedir_columna(jugador):
    while True:
        entrada = input(f"Jugador {jugador} - elige columna (1-{COLUMNS}): ").strip()
        if not entrada:
            print("Entrada vacía. Intenta otra vez.")
            continue
        if not entrada.isdigit():
            print("Por favor ingresa un número.")
            continue
        col = int(entrada) - 1
        if 0 <= col < COLUMNS:
            return col
        else:
            print(f"Número fuera de rango. Debe estar entre 1 y {COLUMNS}.")

def main():
    tablero = crear_tablero()
    juego_terminado = False
    turno = 0  # 0 -> Jugador 1, 1 -> Jugador 2
    fichas = ['X', 'O']

    print("=== Bienvenido a Conecta 4 ===")
    imprimir_tablero(tablero)

    while not juego_terminado:
        jugador = turno % 2
        ficha = fichas[jugador]

        # Pedir columna válida y con espacio
        while True:
            col = pedir_columna(jugador+1)
            if not columna_valida(tablero, col):
                print("Columna llena o inválida. Elige otra.")
            else:
                break

        fila = fila_libre(tablero, col)
        colocar_ficha(tablero, fila, col, ficha)
        imprimir_tablero(tablero)

        # Checar victoria
        if hay_victoria(tablero, ficha):
            print(f"¡Felicidades! Jugador {jugador+1} ({ficha}) ha ganado.")
            juego_terminado = True
            continue

        # Checar empate
        if tablero_lleno(tablero):
            print("Empate. No quedan movimientos.")
            juego_terminado = True
            continue

        turno += 1

    print("Juego finalizado. Gracias por jugar.")

if __name__ == "__main__":
    main()
