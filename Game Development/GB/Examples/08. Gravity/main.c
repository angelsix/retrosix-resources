#include <gb/gb.h>
#include <stdio.h>
#include "Tiles/rusty.h"
#include "Tiles/level.h"
#include "Structures/character.h"

#define MOVEMENT_FRAME_LENGTH 9
#define ANIMATION_FRAME_LENGTH 2

// Create a new instance of Player 1
Character player1;
uint8_t movementFrameCount = 0;
uint8_t animationFrameCount = 0;
uint8_t jumpFrameCount = 0;
int8_t lastMovementX = 0;
int8_t lastMovementY = 0;
int8_t slowingX = 0;

void SetupBackground()
{
     // Load in background tiles
     set_bkg_data(0, level_tileset_size, level_tileset);

     // Set background level map
     set_bkg_tiles(0, 0, 20, 18, level_tilemap);
}

void DetectCollisions(Character *character, uint8_t *predictedX, uint8_t *predictedY)
{
     // If we hit ground...
     if (*predictedY >= 120)
     {
          // Snap to ground
          *predictedY = 120; 

          // Remove velocity
          character->velocityY = 0;
     }
}

void MovementPhysics(Character *character, uint8_t slowDownFrames)
{
     // Reset frame every time we start and stop moving...
     if (
          // Stopped
          (lastMovementX != 0 && character->movementForceX == 0) ||
          // Or started
          (lastMovementX == 0 && character->movementForceX != 0))
          {
               // Reset frame count
               movementFrameCount = 0;
               animationFrameCount = 0;
          }

     // Flag true when we release from movement...
     if (lastMovementX != 0 && character->movementForceX == 0)
          slowingX = lastMovementX > 0 ? 1 : -1;

     // Sprite flip for moving right
     if (lastMovementX <= 0 && character->movementForceX > 0)
          SetSpriteFlip(character, 0, 0);
     // Sprite flip for moving left
     else if (lastMovementX >= 0 && character->movementForceX < 0)
          SetSpriteFlip(character, 1, 0);

     // While moving...
     if (character->movementForceX != 0)
     {
          // Compare movement to animation frames...
          if (0) // movementFrameCount == 2 || movementFrameCount == 6)
          {
               // Don't move during this frame
               character->velocityX = 0;
          }
          else
          {
               // Move character by movement force
               character->velocityX = character->movementForceX;
          }

          // Progress movement counter
          movementFrameCount++;
          
          // Roll around after max frame
          if (movementFrameCount == MOVEMENT_FRAME_LENGTH)
          {
               movementFrameCount = 0;
          }
          
          // Progress animation counter
          animationFrameCount++;
          
          // Roll around after max frame
          if (animationFrameCount == ANIMATION_FRAME_LENGTH)
          {
               animationFrameCount = 0;

               // Move to next animation
               LoadNextSpriteFrame(character);
          }

     }
     // When no longer moving
     else
     {
          if (slowingX && movementFrameCount < slowDownFrames)
          {
               movementFrameCount++;

               // Allow character to move one frame before stopping
               if (movementFrameCount == slowDownFrames - 1)
               {
                    character->velocityX = 0;
                    slowingX = 0;
               }
               else
                    // Continue to move in the direction we were
                    character->velocityX = slowingX;
          }
     }

     // While jumping...
     if (character->movementForceY != 0)
     {
          character->velocityY += character->movementForceY;

          jumpFrameCount = 0;
     }
     // Otherwise, if in the air...
     else if (character->underfootState & FOOT_IN_AIR)
     {
          // Jump frame count from 0 to 60
          jumpFrameCount = (jumpFrameCount + 1) % 60;

          // Apply gravity
          if (jumpFrameCount < 5)
               character->velocityY = -2;
          else if (jumpFrameCount < 10)
               character->velocityY = -1;
          else if (jumpFrameCount < 14)
               character->velocityY = 0;
          else if (jumpFrameCount < 20)
               character->velocityY = 1;
          else
               character->velocityY = 2;
     }

     // Velocity limits
     if (character->velocityY != 0 && character->velocityY < -3)
          character->velocityY = -3;
     if (character->velocityY != 0 && character->velocityY > 3)
          character->velocityY = 3;
     
     // Calculate future position
     uint8_t predictedX = character->x + character->velocityX;
     uint8_t predictedY = character->y + character->velocityY;

     // Update predictions based on collision
     DetectCollisions(character, &predictedX, &predictedY);

     // Move character to new position
     MoveCharacter(character, predictedX, predictedY);

     // Which way were we moving
     lastMovementX = character->movementForceX;
     lastMovementY = character->movementForceY;
}

void main()
{
     // Setup background
     SetupBackground();

     // Fill tileset bank 0 with character sprites
     set_sprite_data(0, rusty_tileset_size, rusty_tileset);

     // Setup Rusty Player
     SetupCharacter(
          // Player 1
          &player1, 
          // Sprite ID: 0
          0, 
          // 2x3 meta-sprite
          2, 3,
          // Tiles start at 0
          0,
          // Total animated frames
          8,
          // Pointer to rusty tilemap
          rusty_tilemap);

     // Move character somewhere
     MoveCharacter(&player1, 28, 120);

     // Show background, sprites, and turn on display
     SHOW_BKG;
     SHOW_SPRITES;
     DISPLAY_ON;

     // Main loop
     while (1)
     {
          // TODO: Level interaction
          player1.underfootState = player1.y >= 120 ? FOOT_ON_LAND : FOOT_IN_AIR;

          // Move the character with the joypad
          MoveCharacterWithJoypad(&player1);

          // Apply movement physics
          MovementPhysics(&player1, 3);

          // Wait for next frame
          wait_vbl_done();
     }
}