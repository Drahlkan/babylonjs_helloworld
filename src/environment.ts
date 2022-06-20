import { Tools, Scene, Vector3, Mesh, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, ArcRotateCamera, HemisphericLight, StandardMaterial, Angle, TransformNode, Texture } from "@babylonjs/core";

export const fileLocation = {
    "models":"assets/models/",
    "textures":"assets/textures/"
}

export const texturesInfo = {
    "ground":[
        {
            "name":"dirt",
            "filename":"dirt.jpg"   
        },
        {
            "name":"sand",
            "filename":"sand.jpg"
        },
        {
            "name":"stone",
            "filename":"stone.png"
        },
        {
            "name":"wood",
            "filename":"wood.jpg"
        },

    ],
    "wall":[
        {
            "name":"leopard",
            "filename":"leopard_fur.jpg"
        },
    ]

}



export class Environment {
    private _scene: Scene;

    private _grounds!: Mesh[];
    public groundSize;
    
    public walls!: Mesh[];
    public wallSize;
    
    public groundTextures!: {name:string, src:string, data:StandardMaterial}[];
    public wallTextures!: {name:string, src:string, data:StandardMaterial}[];

    private _roofs?: Mesh[];
    private _rooms?: TransformNode[];


    constructor(scene: Scene) {
        this._scene = scene;

        this.wallSize = {height:4, depth:0.5}
        this.groundSize = {width:12, height:8}
    }

    public async load() {

        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);

        await this._loadAssets();

        this._createBaseRoom();
    }

    private async _loadAssets() {
        this._loadTextures();
        this._loadModels();
    }

    private _loadTextures() {
        const groundTextures = [];
        for (let groundTexture in texturesInfo.ground) {
            let name = texturesInfo.ground[groundTexture].name
            let src = fileLocation.textures + "ground/" + name + "/" + texturesInfo.ground[groundTexture].filename
            let mat = new StandardMaterial(name)
            mat.diffuseTexture = new Texture(src)
            groundTextures.push({"name":name, "src":src, "data":mat})
        }
        this.groundTextures = groundTextures;
        console.log(this.groundTextures)

        const wallTextures = [];
        for (let wallTexture in texturesInfo.wall) {
            let name = texturesInfo.wall[wallTexture].name
            let src = fileLocation.textures + "wall/" + name + "/" + texturesInfo.wall[wallTexture].filename
            let mat = new StandardMaterial(name)
            mat.diffuseTexture = new Texture(src)
            wallTextures.push({"name":name, "src":src, "data":mat})
        }
        this.wallTextures = wallTextures;
        console.log(this.wallTextures)

    }

    private async _loadModels() {

    }
    
    private async _createBaseRoom() {
        
        this._createGround();
        this._createWalls();
        
    }
    
    private async _createGround() {
        
        let ground = MeshBuilder.CreatePlane("ground", this.groundSize, this._scene);
        
        ground.rotate(new Vector3(1,0,0), Tools.ToRadians(90));

        let groundMaterial = new StandardMaterial("wood");
        groundMaterial.diffuseTexture = new Texture("assets/textures/ground/dirt/dirt.jpg", this._scene)
        ground.checkCollisions = true;

        this._grounds?.push(ground);
    }

    private async _createWalls() {

        let frontWall = MeshBuilder.CreateBox("frontWall", {width:this.groundSize.width, height:this.wallSize.height, depth:this.wallSize.depth}, this._scene);
        frontWall.position.y = this.wallSize.height/2;
        frontWall.position.z = this.groundSize.height/2 + this.wallSize.depth/2;

        let frontWallMaterial = new StandardMaterial("frontWallMaterial")
        frontWallMaterial.diffuseColor = new Color3(1,0,0)
        frontWall.material = frontWallMaterial


        let leftWall = MeshBuilder.CreateBox("leftWall", {width:this.groundSize.height, height:this.wallSize.height, depth:this.wallSize.depth}, this._scene)
        leftWall.position.y = this.wallSize.height/2;
        leftWall.position.x = - (this.groundSize.width/2 + this.wallSize.depth/2);
        leftWall.rotate(new Vector3(0,1,0), Tools.ToRadians(90));
        
        let leftWallMaterial = new StandardMaterial("leftWallMaterial")
        leftWallMaterial.diffuseColor = new Color3(0,1,0)
        leftWall.material = leftWallMaterial


        let backWall = MeshBuilder.CreateBox("backWall", {width:this.groundSize.width, height:this.wallSize.height, depth:this.wallSize.depth}, this._scene)
        backWall.position.y = this.wallSize.height/2;
        backWall.position.z = -(this.groundSize.height/2 + this.wallSize.depth/2);

        let backWallMaterial = new StandardMaterial("backWallMaterial")
        backWallMaterial.diffuseColor = new Color3(0,0,1)
        backWall.material = backWallMaterial


        let rightWall = MeshBuilder.CreateBox("rightWall", {width:this.groundSize.height, height:this.wallSize.height, depth:this.wallSize.depth}, this._scene)
        rightWall.position.y = this.wallSize.height/2;
        rightWall.position.x = this.groundSize.width/2 + this.wallSize.depth/2;
        rightWall.rotate(new Vector3(0,1,0), Tools.ToRadians(90));
        
        let rightWallMaterial = new StandardMaterial("rightWallMaterial")
        rightWallMaterial.diffuseColor = new Color3(1,1,1)
        rightWall.material = rightWallMaterial
        
        this.walls = [frontWall, leftWall, backWall, rightWall]
        for (let i = 0; i < this.walls?.length ; i++) {
            this.walls[i].checkCollisions = true;
        }
    }

    private async _createRoof() {
        
    }
}