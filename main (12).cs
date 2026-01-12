using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

class SnakeGame
{
    static int width = 40;
    static int height = 20;
    static int score = 0;
    static bool gameOver = false;

    static int snakeX = width / 2;
    static int snakeY = height / 2;

    static int foodX;
    static int foodY;

    static int velocityX = 1;
    static int velocityY = 0;

    static List<int> tailX = new List<int>();
    static List<int> tailY = new List<int>();

    static Random rand = new Random();

    static void Main()
    {
        Console.CursorVisible = false;
        SpawnFood();

        while (!gameOver)
        {
            Draw();
            Input();
            Logic();
            Thread.Sleep(100);
        }

        Console.Clear();
        Console.WriteLine("=== GAME OVER ===");
        Console.WriteLine($"Score: {score}");
        Console.WriteLine("Presiona ENTER para reiniciar o ESC para salir...");

        var key = Console.ReadKey(true).Key;
        if (key == ConsoleKey.Enter)
        {
            score = 0;
            snakeX = width / 2;
            snakeY = height / 2;
            tailX.Clear();
            tailY.Clear();
            velocityX = 1;
            velocityY = 0;
            gameOver = false;
            Main();
        }
    }

    static void Draw()
    {
        Console.Clear();

        for (int i = 0; i < width + 2; i++)
            Console.Write("#");
        Console.WriteLine();

        for (int y = 0; y < height; y++)
        {
            Console.Write("#");
            for (int x = 0; x < width; x++)
            {
                if (x == snakeX && y == snakeY)
                    Console.Write("O");
                else if (x == foodX && y == foodY)
                    Console.Write("@");
                else
                {
                    bool print = false;
                    for (int k = 0; k < tailX.Count; k++)
                    {
                        if (tailX[k] == x && tailY[k] == y)
                        {
                            Console.Write("o");
                            print = true;
                            break;
                        }
                    }
                    if (!print) Console.Write(" ");
                }
            }
            Console.WriteLine("#");
        }

        for (int i = 0; i < width + 2; i++)
            Console.Write("#");

        Console.WriteLine();
        Console.WriteLine($"Score: {score}");
    }

    static void Input()
    {
        if (Console.KeyAvailable)
        {
            var key = Console.ReadKey(true).Key;

            switch (key)
            {
                case ConsoleKey.LeftArrow:
                case ConsoleKey.A:
                    if (velocityX != 1) { velocityX = -1; velocityY = 0; }
                    break;
                case ConsoleKey.RightArrow:
                case ConsoleKey.D:
                    if (velocityX != -1) { velocityX = 1; velocityY = 0; }
                    break;
                case ConsoleKey.UpArrow:
                case ConsoleKey.W:
                    if (velocityY != 1) { velocityY = -1; velocityX = 0; }
                    break;
                case ConsoleKey.DownArrow:
                case ConsoleKey.S:
                    if (velocityY != -1) { velocityY = 1; velocityX = 0; }
                    break;
                case ConsoleKey.Escape:
                    gameOver = true;
                    break;
            }
        }
    }

    static void Logic()
    {
        int prevX = snakeX;
        int prevY = snakeY;

        snakeX += velocityX;
        snakeY += velocityY;

        if (snakeX < 0 || snakeX >= width || snakeY < 0 || snakeY >= height)
        {
            gameOver = true;
            return;
        }

        for (int i = tailX.Count - 1; i > 0; i--)
        {
            tailX[i] = tailX[i - 1];
            tailY[i] = tailY[i - 1];
        }

        if (tailX.Count > 0)
        {
            tailX[0] = prevX;
            tailY[0] = prevY;
        }

        if (snakeX == foodX && snakeY == foodY)
        {
            score += 10;
            tailX.Add(prevX);
            tailY.Add(prevY);
            SpawnFood();
        }

        for (int i = 0; i < tailX.Count; i++)
        {
            if (tailX[i] == snakeX && tailY[i] == snakeY)
            {
                gameOver = true;
                break;
            }
        }
    }

    static void SpawnFood()
    {
        foodX = rand.Next(0, width);
        foodY = rand.Next(0, height);
    }
}
