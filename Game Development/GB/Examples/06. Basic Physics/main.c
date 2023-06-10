#include <gb/gb.h>
#include <stdio.h>
#include "Tiles/tileset_rusty.h"
#include "Tiles/tileset_rusty_small.h"
#include "Tiles/tileset_level.h"
#include "Structures/character.h"

#define PLAYER_1_ANIMATION_FRAMES 9

// Create a new instance of Player 1
Character player1;
uint8_t frameCount = 0;
int8_t lastMovementX = 0;
int8_t lastMovementY = 0;
int8_t slowingX = 0;

void SetupBackground()
{
     // Load in background tiles
     set_bkg_data(0, tileset_level_size, tileset_level);

     // Set background level map
     set_bkg_tiles(0, 0, 20, 18, tilemap_level);
}

void MovementPhysics(Character *character, uint8_t slowDownFrames)
{
     // Calculate if in air
     uint8_t inAir = 0;
     inAir = character->y < 112;

     // Reset frame every time we start and stop moving...
     if (
          // Stopped
          (lastMovementX != 0 && character->movementForceX == 0) ||
          // Or started
          (lastMovementX == 0 && character->movementForceX != 0))
          {
               // Reset frame count
               frameCount = 0;
          }

     // Flag true when we release from movement...
     if (lastMovementX != 0 && character->movementForceX == 0)
          slowingX = lastMovementX > 0 ? 1 : -1;

     // While moving...
     if (character->movementForceX != 0)
     {
          // Compare movement to animation frames...
          if (frameCount == 2 || frameCount == 6)
          {
               // Don't move during this frame
               character->velocityX = 0;
          }
          else
          {
               // Move character by movement force
               character->velocityX = character->movementForceX;
          }

          // Increment frame count
          frameCount++;
          
          // Roll around after max frame
          if (frameCount == PLAYER_1_ANIMATION_FRAMES)
          {
               frameCount = 0;
          }
     }
     // When no longer moving
     else
     {
          if (slowingX && frameCount < slowDownFrames)
          {
               frameCount++;

               // Allow character to move one frame before stopping
               if (frameCount == slowDownFrames - 1)
               {
                    character->velocityX = 0;
                    slowingX = 0;
               }
               else
                    // Continue to move in the direction we were
                    character->velocityX = slowingX;
          }
     }
     
     // Calculate future position
     uint8_t predictedX = character->x + character->velocityX;

     // Move character to new position
     MoveCharacter(character, predictedX, character->y);

     // Which way were we moving
     lastMovementX = character->movementForceX;
     lastMovementY = character->movementForceY;
}

void main()
{
     // Setup background
     SetupBackground();

     // Fill tileset bank 0 with character sprites
     set_sprite_data(0, tileset_rusty_small_size, tileset_rusty_small);

     // Setup Rusty Player
     SetupCharacter(
          // Player 1
          &player1, 
          // Sprite ID: 0
          0, 
          // 4x4 meta-sprite
          2, 4,
          // Tiles start at 0
          0,
          // Total animated frames
          PLAYER_1_ANIMATION_FRAMES,
          // Pointer to rusty tilemap
          tilemap_rusty_small);

     // Move character somewhere
     MoveCharacter(&player1, 28, 112);

     // Show background, sprites, and turn on display
     SHOW_BKG;
     SHOW_SPRITES;
     DISPLAY_ON;

     // Main loop
     while (1)
     {
          // Move the character with the joypad
          MoveCharacterWithJoypad(&player1);

          // Apply movement physics
          MovementPhysics(&player1, 3);

          // Wait for next frame
          wait_vbl_done();
     }
}