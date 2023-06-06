#include <gb/gb.h>
#include <stdio.h>
#include "rusty_tiles.h"
#include "unique_tiles.h"
#include "unique_invert_tiles.h"

void main()
{
     //set_sprite_data(0, unique_tileset_size, unique_tileset);
     set_bkg_data(0, unique_invert_tileset_size, unique_invert_tileset);

     // Fill tileset bank 0 with character sprites
     set_sprite_data(0, rusty_tileset_size, rusty_tileset);

     // Set sprite 0-15 to character
     set_sprite_tile(0, rusty_tilemap[0]);
     set_sprite_tile(1, rusty_tilemap[1]);
     set_sprite_tile(2, rusty_tilemap[2]);
     set_sprite_tile(3, rusty_tilemap[3]);
     set_sprite_tile(4, rusty_tilemap[4]);
     set_sprite_tile(5, rusty_tilemap[5]);
     set_sprite_tile(6, rusty_tilemap[6]);
     set_sprite_tile(7, rusty_tilemap[7]);
     set_sprite_tile(8, rusty_tilemap[8]);
     set_sprite_tile(9, rusty_tilemap[9]);
     set_sprite_tile(10, rusty_tilemap[10]);
     set_sprite_tile(11, rusty_tilemap[11]);
     set_sprite_tile(12, rusty_tilemap[12]);
     set_sprite_tile(13, rusty_tilemap[13]);
     set_sprite_tile(14, rusty_tilemap[14]);
     set_sprite_tile(15, rusty_tilemap[15]);

     // Move character to screen
     move_sprite(0, 8, 16);
     move_sprite(1, 16, 16);
     move_sprite(2, 24, 16);
     move_sprite(3, 32, 16);
     move_sprite(4, 8, 24);
     move_sprite(5, 16, 24);
     move_sprite(6, 24, 24);
     move_sprite(7, 32, 24);
     move_sprite(8, 8, 32);
     move_sprite(9, 16, 32);
     move_sprite(10, 24, 32);
     move_sprite(11, 32, 32);
     move_sprite(12, 8, 40);
     move_sprite(13, 16, 40);
     move_sprite(14, 24, 40);
     move_sprite(15, 32, 40);


     // Show background, sprites, and turn on display
     SHOW_BKG;
     SHOW_SPRITES;
     DISPLAY_ON;

     // Main loop
     while (1)
     {
          // Read buttons
          uint8_t buttons = joypad();

          uint8_t moveX = 0;
          uint8_t moveY = 0;

          if (buttons & J_LEFT)
          {
               moveX = -1;
          }
          else if (buttons & J_RIGHT)
          {
               moveX = 1;
          }

          if (buttons & J_UP)
          {
               moveY = -1;
          }
          else if (buttons & J_DOWN)
          {
               moveY = 1;
          }

          // Move our character
          scroll_sprite(0, moveX, moveY);
          scroll_sprite(1, moveX, moveY);
          scroll_sprite(2, moveX, moveY);
          scroll_sprite(3, moveX, moveY);
          scroll_sprite(4, moveX, moveY);
          scroll_sprite(5, moveX, moveY);
          scroll_sprite(6, moveX, moveY);
          scroll_sprite(7, moveX, moveY);
          scroll_sprite(8, moveX, moveY);
          scroll_sprite(9, moveX, moveY);
          scroll_sprite(10, moveX, moveY);
          scroll_sprite(11, moveX, moveY);
          scroll_sprite(12, moveX, moveY);
          scroll_sprite(13, moveX, moveY);
          scroll_sprite(14, moveX, moveY);
          scroll_sprite(15, moveX, moveY);

          // Wait for next frame
          wait_vbl_done();
     }
}