#include <gb/gb.h>
#include <stdio.h>

// A structure for a character
typedef struct Character
{
    // The starting ID of the sprite for this character
    // Remaining sprites should follow in sequency
    uint8_t spriteId;

    // The number of tiles wide this sprite is
    uint8_t spriteTileWidth;

    // The number of tiles high this sprite is
    uint8_t spriteTileHeight;
    
    // The total number of animated frames
    uint8_t spriteFrames;

    // The current frame the sprite is on
    uint8_t spriteCurrentFrame;
    
    // The start index where the tiles starts inside the set
    uint8_t tilesetStart;

    // The sprite X position (top left)
    uint8_t x;

    // The sprite Y position (top left)
    uint8_t y;

    // The current speed of travel in the X direction
    uint8_t velocityX;

    // The current speed of travel in the Y direction
    uint8_t velocityY;

    // The movement force wanting to act upon the X direction
    int8_t movementForceX;

    // The movement force wanting to act upon the Y direction
    int8_t movementForceY;
    
    // A pointer to the tilemap
    const unsigned char *tilemap;

} Character;


void LoadSpriteFrame(Character *character, uint8_t frame)
{
    // Set current frame
    character->spriteCurrentFrame = frame;

    // Get total sprites
    uint8_t spriteCount = character->spriteTileWidth * character->spriteTileHeight;

    for (uint8_t i = 0; i != spriteCount; i++)
    {
        // Set sprite tile
        set_sprite_tile(character->spriteId + i, character->tilemap[i + (frame * spriteCount)] + character->tilesetStart);
    }
}

void MoveCharacter(Character *character, uint8_t x, uint8_t y)
{
    // Set characters new position
    character->x = x;
    character->y = y;

    for (uint8_t iy = 0; iy != character->spriteTileHeight; iy++)
    {
        for (uint8_t ix = 0; ix != character->spriteTileWidth; ix++)
        {
            // Calculate sprite index
            uint8_t index = character->spriteId + ix + (iy * character->spriteTileWidth);

            // Move character to screen
            move_sprite(index, x + (ix * 8), y + (iy * 8));       
        }
    }
}

void ScrollCharacter(Character *character, int8_t x, int8_t y)
{
    character->x += x;
    character->y += y;

    MoveCharacter(character, character->x, character->y);
}

void MoveCharacterWithJoypad(Character *character)
{
    // Read buttons
    uint8_t buttons = joypad();

    int8_t moveX = 0;
    int8_t moveY = 0;

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
    // Jumping
    else if (buttons & J_A)
    {

    }

    // Set movement force
    character->movementForceX = moveX;
    character->movementForceY = moveY;
}

void SetupCharacter(Character *character, uint8_t spriteId,
     uint8_t tileWidth, uint8_t tileHeight, uint8_t tilesetStart,
     uint8_t totalFrames, const unsigned char *tilemap)
{
    // Store pointer to tilemap
    character->tilemap = tilemap;

    // Set tile start position (in tileset)
    character->tilesetStart = tilesetStart;

    // Set player sprite ID
    character->spriteId = spriteId;

    // Set size
    character->spriteTileWidth = tileWidth;
    character->spriteTileHeight = tileHeight;

    // Set number of frames
    character->spriteFrames = totalFrames;

    // Load first sprite frame
    LoadSpriteFrame(character, 0);
}