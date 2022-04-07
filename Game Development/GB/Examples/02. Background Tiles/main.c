#include <gb/gb.h>
#include <stdio.h>
#include "NumberTiles.c"

void main()
{
     // Load tileset into GB memory
     set_bkg_data(0, 11, NumberTiles);
     
     // Fill entire screen with 1st tile
     init_bkg(6);

     // Show background
     SHOW_BKG;
     DISPLAY_ON;

     while (1)
     {
          scroll_bkg(1, 0);
          delay(200);
     }
}