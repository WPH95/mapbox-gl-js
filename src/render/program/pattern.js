// @flow

import assert from 'assert';
import {
    Uniform1i,
    Uniform1f,
    Uniform2f,
} from '../uniform_binding';
import pixelsToTileUnits from '../../source/pixels_to_tile_units';

import type Painter from '../painter';
import type {OverscaledTileID} from '../../source/tile_id';
import type {CrossFaded} from '../../style/cross_faded';
import type {UniformValues} from '../uniform_binding';

type PatternUniformsType = {|
    'u_image': Uniform1i,
    'u_pattern_tl_a': Uniform2f,
    'u_pattern_br_a': Uniform2f,
    'u_pattern_tl_b': Uniform2f,
    'u_pattern_br_b': Uniform2f,
    'u_texsize': Uniform2f,
    'u_mix': Uniform1f,
    'u_pattern_size_a': Uniform2f,
    'u_pattern_size_b': Uniform2f,
    'u_scale_a': Uniform1f,
    'u_scale_b': Uniform1f,
    'u_pixel_coord_upper': Uniform2f,
    'u_pixel_coord_lower': Uniform2f,
    'u_tile_units_to_pixels': Uniform1f
|};

function patternUniformValues(image: CrossFaded<string>, painter: Painter,
        tile: {tileID: OverscaledTileID, tileSize: number}
): UniformValues<PatternUniformsType> {
    const imagePosA = painter.imageManager.getPattern(image.from);
    const imagePosB = painter.imageManager.getPattern(image.to);
    assert(imagePosA && imagePosB);
    const {width, height} = painter.imageManager.getPixelSize();

    const numTiles = Math.pow(2, tile.tileID.overscaledZ);
    const tileSizeAtNearestZoom = tile.tileSize * Math.pow(2, painter.transform.tileZoom) / numTiles;

    const pixelX = tileSizeAtNearestZoom * (tile.tileID.canonical.x + tile.tileID.wrap * numTiles);
    const pixelY = tileSizeAtNearestZoom * tile.tileID.canonical.y;

    return {
        'u_image': 0,
        'u_pattern_tl_a': (imagePosA: any).tl,
        'u_pattern_br_a': (imagePosA: any).br,
        'u_pattern_tl_b': (imagePosB: any).tl,
        'u_pattern_br_b': (imagePosB: any).br,
        'u_texsize': [width, height],
        'u_mix': image.t,
        'u_pattern_size_a': (imagePosA: any).displaySize,
        'u_pattern_size_b': (imagePosB: any).displaySize,
        'u_scale_a': image.fromScale,
        'u_scale_b': image.toScale,
        'u_tile_units_to_pixels': 1 / pixelsToTileUnits(tile, 1, painter.transform.tileZoom),
        // split the pixel coord into two pairs of 16 bit numbers. The glsl spec only guarantees 16 bits of precision.
        'u_pixel_coord_upper': [pixelX >> 16, pixelY >> 16],
        'u_pixel_coord_lower': [pixelX & 0xFFFF, pixelY & 0xFFFF]
    };
}

export { patternUniformValues };
