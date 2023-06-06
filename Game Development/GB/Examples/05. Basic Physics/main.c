#include <gb/gb.h>
#include <stdio.h>
#include "Tiles/tileset_rusty.h"
#include "Tiles/tileset_level.h"
#include "Structures/character.h"

// Create a new instance of Player 1
Character player1;
Character player2;

void SetupBackground()
{
     // Load in background tiles
     set_bkg_data(0, tileset_level_size, tileset_level);

     // Set background level map
     set_bkg_tiles(0, 0, 20, 18, tilemap_level);
}

void main()
{
     // Setup background
     SetupBackground();

     // Fill tileset bank 0 with character sprites
     set_sprite_data(0, tileset_rusty_size, tileset_rusty);

     // Setup Rusty Player
     SetupCharacter(
          // Player 1
          &player1, 
          // Sprite ID: 0
          0, 
          // 4x4 meta-sprite
          4, 4,
          // Tiles start at 0
          0,
          // Total animated frames
          9,
          // Pointer to rusty tilemap
          tilemap_rusty);

     // Move character somewhere
     MoveCharacter(&player1, 64, 100);

     // Show background, sprites, and turn on display
     SHOW_BKG;
     SHOW_SPRITES;
     DISPLAY_ON;

     // Main loop
     while (1)
     {
          // Move the character with the joypad
          MoveCharacterWithJoypad(&player1);

          // Wait for next frame
          wait_vbl_done();
     }
}