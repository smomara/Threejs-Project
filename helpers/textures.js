import * as THREE from "three";

export function getRandomMountainTexture() {
    const mountainTextures = [
        'mountain0.jpg',
        'mountain1.jpg',
        'mountain2.jpg',
        'mountain3.jpg',
        'mountain4.jpg',
    ];

    const randomIndex = Math.floor(Math.random() * mountainTextures.length);
    const randomTexture = mountainTextures[randomIndex];
    return new THREE.TextureLoader().load(`media/${randomTexture}`);
}