import { Engine, Scene, Vector3, Mesh, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, ArcRotateCamera, HemisphericLight, TransformNode, Camera } from "@babylonjs/core";
import { PlayerInput } from "./inputController";

export class Controller extends TransformNode {
    public camera?: Camera;
    public scene: Scene;
   // private _input: PlayerInput;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    constructor(mesh: Mesh, scene: Scene, input?: PlayerInput) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = mesh;
        this.mesh.parent = this;


        //this._input = input; //inputs we will get from inputController.ts
    }

    private _setupPlayerCamera() {
        var camera4 = new ArcRotateCamera("arc", -Math.PI/2, Math.PI/2, 40, new Vector3(0,3,0), this.scene);
    }

}