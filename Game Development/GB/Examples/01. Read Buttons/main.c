#include <gb/gb.h>
#include <stdio.h>

void main()
{
    uint8_t mButtons;

    printf("Press any button...");

    while (1)
    {
        mButtons = joypad();

        if (mButtons & J_A)
            printf("A ");
       if (mButtons & J_B)
            printf("B ");
       if (mButtons & J_UP)
            printf("U ");
       if (mButtons & J_DOWN)
            printf("D ");
       if (mButtons & J_LEFT)
            printf("L ");
       if (mButtons & J_RIGHT)
            printf("R ");
       if (mButtons & J_START)
            printf("+ ");
       if (mButtons & J_SELECT)
            printf("- ");

        printf("\n");

        while (mButtons == joypad());
    }
}