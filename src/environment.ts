import { Engine, Scene, Vector3, Mesh, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, ArcRotateCamera, HemisphericLight } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        var ground = MeshBuilder.CreatePlane("ground", {size:24}, this._scene);
        ground.scaling = new Vector3(1,1,1);
    }
}