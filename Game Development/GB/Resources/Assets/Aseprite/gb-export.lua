-- boombuler, for his version of the plugin, (found here : https://github.com/boombuler/aseprite-gbexport)
local sprite = app.activeSprite
local layer = app.activeLayer
local tile_layers = {}
local n_layer = 0

local plt = sprite.palettes[1] -- DEFINES THE PALETTE

local tile_amount = 0

local function set_folderpath(fullPath)

    local lastIndex = string.find(fullPath, "[^\\]+$")
    if lastIndex == nil then
        return fullPath
    end

    return string.sub(fullPath, 1, lastIndex - 1)
end

local function set_filename(fullPath)

    local extIndex = string.find(fullPath, "[^.]+$")
    if extIndex == nil then
        return set_folderpath(fullPath)
    end

    local lastFolderIndex = string.find(fullPath, "[^\\]+$")
    if lastFolderIndex == nil then
        return fullPath
    end

    return string.sub(fullPath, lastFolderIndex, extIndex - 2)
end

local fullPathNoExtension = set_folderpath(sprite.filename)
local filename = set_filename(sprite.filename)

local tile_name = ""
local map_name = ""

local w = 0 -- MAP WIDTH
local h = 0 -- MAP HEIGHT

-- INITIAL CHECKS FOR VALID FILE -- 

if sprite == nil then -- CHECKS IF THERE'S AN IMAGE LOADED
    app.alert {
        title = "MAJOR ERROR",
        text = "THERE'S NO FILE OPEN",
        buttons = "Oh crap"
    }
    return
end

for i, current_layer in ipairs(sprite.layers) do
    if current_layer.isTilemap then
        tile_layers[n_layer] = current_layer
        n_layer = n_layer + 1
    end
end

if n_layer == 0 then
    app.alert {
        title = "ERROR",
        text = "There is no Tilemap Layer"
    }
    return
end

if ColorMode.TILEMAP == nil then -- CHECKS FOR TILEMAP
    app.alert {
        title = "ERROR",
        text = "This file does not make use of tilemaps"
    }
    return
end

if sprite.height % 8 ~= 0 or sprite.width % 8 ~= 0 then -- CHECKS FOR IMAGE DIMENSIONS, GAMEBOY USES 8X8 TILES, FOR THE IMAGE MUST BE A MULTIPLE
    app.alert {
        title = "ERROR",
        text = "Canvas width or height is not multiple of 8.",
        buttons = "OK"
    }
    return
end

if (layer.tileset.grid.tileSize.width ~= 8 or layer.tileset.grid.tileSize.height ~= 8) then
    app.alert {
        title = "ERROR",
        text = "Tile Size is not 8x8 px",
        buttons = "OK"
    }
    return
end

if sprite.colorMode ~= ColorMode.INDEXED then -- CHECKS IF THE COLOR MODE IS SET TO INDEXED
    app.alert {
        title = "ERROR",
        text = {" Color Mode must be", "INDEXED", "and have only 4 colors"},
        buttons = "Oh, my bad"
    }
    return
elseif #plt ~= 4 then -- IF IT IS INDEXED, CHECKS IF IT DOES HAVE 4 COLORS 
    app.alert {
        title = "ERROR",
        text = "Number of colors MUST BE 4",
        buttont = "Oops"
    }
    return
end

-- INITIAL CHECKS DONE--

-- USER INPUT--

local dlg = Dialog {
    title = "Game Boy Exporter"
}

dlg:label{
    id = "label-01",
    text = "Pick a location to save the file."
}
dlg:newrow()

dlg:file{
    id = "filepath",
    label = "Save Location",
    filetypes = {"c"},
    save = true
}

-- NEEDS FILE PATH TO EXPORT
-- NAME FOR TILESET
-- NAME FOR TILEMAP
-- CHECK BOX FOR TILESET(EXPORT TILESET)
-- CHECK BOX FOR TILEMAP(EXPORT TILEMAP)

dlg:button{
    id = "confirm",
    text = "OK"
}
dlg:button{
    id = "cancel",
    text = "Cancel"
}

dlg:show{
    wait = true
}

-- FUNCTIONS ARE DECLARED HERE-- 

local dlg_data = dlg.data -- SAVES USER INPUT

local function tile_to_hex(tile) -- THE FUNCTION (GET PIXEL) FOR THE TILE RETURNS THE INDEX OF THE COLOR USED, WHICH IS WHY IT'S MULTIPLIED BY 75

    -- ****HOW TO GAMEBOY WORKS WITH 2BITS PER PIXEL (2BPP)****--

    -- EACH PIXEL IS A SET OF TWO DIGITS (BITS) SO WE TAKE A ROW AS A FULL BYTE
    -- SEPARATES THE NUMBER(BINARY) INTO PAIRS OF DIGITS
    -- THE PAIRS ARE THEM SEPARATED INTO  "HIGH BITE" (LEFT) AND "LOW BITE" (RIGHT)
    -- THEM YOU JOIN THE HIGHS AND THE LOWS, AND END UP WITH TWO BYTES (8 DIGITS EACH)
    -- THEN YOU PUT THE LOW BYTES FIRST AND THE HIGHS SECOND

    local hex = ""
    local range_x = tile.width - 1
    local range_y = tile.height - 1

    for y = 0, range_y do -- LOOPS Y AXIS
        local lo_bit = 0; -- resets the low bit per each y value (for each row)
        local hi_bit = 0; -- resets the high bit per each y value (for each row)

        for x = 0, range_x do -- LOOPS X AXIS
            local pixel = tile:getPixel(x, y)
            if (pixel & 1) ~= 0 then -- 1 IN BINARY = 01 
                lo_bit = lo_bit | (1 << range_x - x) -- THE OPERATOR (1<< n-0) would be invalid, so we add (lo_bit |) 
            end

            if (pixel & 2) ~= 0 then -- 2 IN BINARY == 10
                hi_bit = hi_bit | (1 << range_x - x)
            end
            -- WAS USING AND INSTEAD OF & AND APARENTLY THAT WAS MESSING UP THE CODE, THANKS AGAIN TO boombuler FOR HIS CODE (LIFE SAVING)
        end

        hex = hex .. (string.format("0x" .. "%02x, " .. "0x" .. "%02x, ", lo_bit, hi_bit))

    end
    hex = hex .. "\n"

    -- print(hex)

    return hex -- RETURNS A FORMATED STRING WITH HEX VALUES OF THE TILES;

end

local function export_tileset(tileset) -- HANDLES SINGLE TILESET PASSED FROM EXPORT_TILESETS FUNCTION
    local t = {}
    local grid = tileset.grid
    local size = grid.tileSize
    tile_amount = #tileset

    for i = 0, #tileset - 1 do
        local tile = tileset:getTile(i)
        local hex = tile_to_hex(tile)
        -- t[i] = tile_to_hex(tile)
        -- print(hex)
        table.insert(t, hex)

    end

    return t

end

local function export_tilesets(tilesets) -- RECEIVES ALL THE TILESETS AND LOOPS, PASSING SINGLE A TILESET TO EXPORT_TILEST EACH TIME
    local t = {}
    for _, tileset in ipairs(tilesets) do
        table.insert(t, export_tileset(tileset))
        -- print(tileset)
    end
    return t
    -- RETURNS A LIST OF LISTS
    -- HIERARCHY GOES AS FOLLOWS
    -- TABLE:TILESETS (COUNTAINS)-> TABLE:TILESET (COUNTAIS)-> TABLE:TILES (COUNTAIS)-> STRING OF VALUES 
end
-- TODO : FIGURE OUT A WAY TO MAKE THIS HIERARCHY SIMPLER 

local function save_to_C_file(c_file, h_file)
    -- Save as exact name specified
    local file = io.open(fullPathNoExtension .. filename .. ".c", "w")
    file:write(c_file)
    file:close()
    local header = io.open(fullPathNoExtension .. filename .. ".h", "w")
    header:write(h_file)
    header:close()
end

local function parse_input()
    tile_name = "tileset"
    map_name = "tilemap"
    if (dlg_data.filepath ~= "") then

        fullPathNoExtension = set_folderpath(dlg_data.filepath);
        filename = set_filename(dlg_data.filepath);

        -- Name should be filename, ending with _tileset or _tilemap
        tile_name = filename .. "_tileset"
        map_name = filename .. "_tilemap"

    end

end

local function export_c(tab, map)
    local c_file = ""
    local h_file = ""
    c_file = c_file ..
                 "// Generated using GB Export by AngelSix https://github.com/angelsix/retrosix-resources\n// Enhanced version based of original by https://github.com/gabrielcnr\n\n" -- header i suppose
    h_file = c_file

    -- START Export tile map --
    h_file = h_file .. "#define " .. map_name .. "_width " .. tostring(w) .. "\n"
    h_file = h_file .. "#define " .. map_name .. "_height " .. tostring(h) .. "\n"
    -- END Export tile map --

    -- START Export tile set --
    c_file = c_file .. "const unsigned char " .. tile_name .. "[] = {\n\n"
    h_file = h_file .. "\n" .. "#define " .. tile_name .. "_size " .. tostring(tile_amount) .. "\n\n"
    h_file = h_file .. "extern const unsigned char " .. tile_name .. "[]; \n\n"

    for i, tileset in ipairs(tab) do -- TILESET IN TILESETS
        for j, tiles in ipairs(tileset) do -- TILES IN TILESET
            c_file = c_file .. "\t// Tile " .. j .. "\n\t" .. tiles
        end
    end

    c_file = c_file .. "\n}; \n \n"
    -- END Export tile set --

    -- START Export tile map --
    c_file = c_file .. "const unsigned char " .. map_name .. "[] = {\n" .. map .. "\n};"
    h_file = h_file .. "extern const unsigned char " .. map_name .. "[];"
    -- END Export tile map --

    return c_file, h_file
end

local function generate_tilemap()
    local map = ""

    -- NOTE: This returns outdated no longer existing
    --       tile maps (if you convert a layer to and from tilemap)
    --
    -- local tilemap = app.activeCel.image
    -- 
    -- We use layer.cels[celIndex].image instead now which works

    local shouldSlice = false
    local warning = nil

    local celsCount = #layer.cels
    local n = 0
    for celIndex = 1, celsCount, 1 do

        map = map .. "\n\t// Frame " .. celIndex .. "\n\t"

        local image = layer.cels[celIndex].image

        -- NOTE: Cels (image.width / image.height) (tile size) will be smaller 
        --       than the sprite.width and sprite.height (divide by 8 pixels)
        --       if there are totally blank cells above or below

        -- Warn if we know cels are less than sprite size
        if sprite.width / 8 ~= image.width or sprite.height / 8 ~= image.height then
            -- NOTE: // for division is the same as doing math.floor(a / b)
            --       Basically divide then convert back to integer
            warning =
                {"Cel (" .. image.width .. " x " .. image.height .. ") is smaller than sprite (" .. sprite.width // 8 ..
                    " x " .. sprite.height // 8 .. ")", "Consider using the Slices script instead"}
        end

        for i in image:pixels() do


            map = map .. "0x" .. string.format("%02x", i()) .. ", "
            n = n + 1
            -- print("tile is ",i()) --DON'T ASK ME WHY, BUT i() RETURNS THE INDEX OF THE TILES IN THE MAP, SO I'LL TAKE IT
        end

        map = map .. "\n"
    end

    if warning ~= nil then
        app.alert {
            title = "WARNING",
            text = warning,
            buttont = "Oops"
        }
    end

    return map

end

local function do_code()
    local tab = {export_tileset(layer.tileset)} -- GENERATES TILESET
    local map = generate_tilemap() -- GENERATES TILEMAP

    local c_file, h_file -- IS THE STRINGS TO BE USED WHEN EXPORTING THE TILEMAP

    c_file, h_file = export_c(tab, map)
    save_to_C_file(c_file, h_file)

    print(h_file .. "\n")
    print(c_file)

end
-- CODE EXECUTION--

if dlg_data.confirm then
    parse_input()
    do_code() -- CODE GOES IN THERE TO STOP EXECUTION IF USER DIDN'T CLICK IN OK
end
if dlg_data.cancel then
    return
end
