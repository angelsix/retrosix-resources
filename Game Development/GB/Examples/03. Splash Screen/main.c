#include <gb/gb.h>
#include <stdio.h>
#include "splashscreen_tileset.h"

void main()
{
     // Load tileset into GB memory
     set_bkg_data(0, splashscreen_tileset_size, splashscreen_tileset);

     // Fill screen with splashscreen map
     set_bkg_tiles(0, 0, 20, 18, splashscreen_tilemap);

     // Show background
     SHOW_BKG;
     DISPLAY_ON;

     while (1)
     {
          wait_vbl_done();
     }
}