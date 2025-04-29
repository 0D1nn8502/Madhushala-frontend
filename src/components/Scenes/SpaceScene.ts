import Phaser from 'phaser';
import axios from 'axios';

export class SpaceScene extends Phaser.Scene {
    private apiUrl: string = '';
    private spaceData: any; 

    private placedProps: Array<{ elementName: string, elementId: string; x: number; y: number }> = []; //Convert to ObjectId at backend // 

    private palette!: Phaser.GameObjects.Container;
    private currentDragSprite: Phaser.GameObjects.Image | null = null;
    private elements: Array<{ _id: string; name: string; imageUrl: string; scale?: number }> = [];
    private signBoardCount: number = 0;
    private greenTreeCount: number = 0;

    constructor() {
        super({ key: 'SpaceScene' });
    }

    init(data: any) {
        this.apiUrl = data.apiUrl;
        this.spaceData = data; 
    }

    async preload() {

        this.load.image('grass', 'https://madhushala-bucket.s3.ap-south-1.amazonaws.com/tiles/Grass1.png');

        await this.fetchElements();

        this.elements.forEach(element => {
            this.load.image(element.name, element.imageUrl); // Load each image using the elementId and imageUrl
        });

    }

    async create() {
        // Fetch available props //  
        await this.fetchElements();

        this.add.tileSprite(0, 0, 1500, 1500, "grass").setOrigin(0, 0);

        // Selector // 
        this.palette = this.add.container(1100, 200);


        // Add fetched props to palette // 
        this.elements.forEach((element, index) => {
            const propImage = this.add.image(0, index * 100, element.name)
                .setScale(element.scale || 1)
                .setInteractive({ cursor: 'pointer' });


            // Store the elementId in the image for later use
            propImage.setData('elementId', element._id);
            propImage.setData('name', element.name);
            this.palette.add(propImage);
        });


        // Drag n Drop functionality // 
        this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image) => {
            if (obj.parentContainer === this.palette) {

                // Check the counter based on the prop type
                if (obj.texture.key === 'greenTree' && this.greenTreeCount >= 20) {
                    alert("You cannot add more than 20 trees.");
                    return; // Prevent adding more trees
                }
                if (obj.texture.key === 'signboard' && this.signBoardCount >= 7) {
                    alert("You cannot add more than 7 signboards.");
                    return; // Prevent adding more signboards
                }

                this.currentDragSprite = this.add.image(pointer.x, pointer.y, obj.texture.key)
                    .setScale(obj.scaleX, obj.scaleY)
                    .setInteractive();

                // Store the elementId from the dragged object
                const elementId = obj.getData('elementId');
                const elementName = obj.getData('name');
                this.currentDragSprite.setData('elementId', elementId);
                this.currentDragSprite.setData('name', elementName);
            }
        });

        // 3) While moving the pointer, move the clone with it: // 
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.currentDragSprite) {
                this.currentDragSprite.x = pointer.x;
                this.currentDragSprite.y = pointer.y;
            }
        });

        // 4) On release, either save it or toss it: // 
        this.input.on('pointerup', () => {
            if (!this.currentDragSprite) return;

            const x = this.currentDragSprite.x;
            const y = this.currentDragSprite.y;
            // check your world bounds (0–1500 here): // 
            if (x >= 0 && x <= 1500 && y >= 0 && y <= 1500) {

                const elementId = this.currentDragSprite.getData('elementId');

                const elementName = this.currentDragSprite.getData('name');

                this.placedProps.push({
                    elementName,
                    elementId,
                    x,
                    y
                });

                // Increment the appropriate counter
                if (this.currentDragSprite.texture.key === 'greenTree') {
                    this.greenTreeCount += 1;
                } else if (this.currentDragSprite.texture.key === 'signboard') {
                    this.signBoardCount += 1;
                }

                console.log(this.placedProps);

            } else {
                // dropped outside, destroy
                this.currentDragSprite.destroy();
            }

            this.currentDragSprite = null;
        });

        // Add a confirmation button to save the space // 
        const saveButton = this.add.text(300, 0, 'Save Space', { fontSize: '30px' })
            .setInteractive()
            .on('pointerdown', () => this.saveSpace())
            .on('pointerover', () => saveButton.setStyle({ fill: '#ff0' }))
            .on('pointerout', () => saveButton.setStyle({ fill: '#fff' }));

        const cancelButton = this.add.text(550, 0, 'Cancel', { fontSize: '30px' })
            .setInteractive()
            .on('pointerdown', () => this.goBack())
            .on('pointerover', () => cancelButton.setStyle({ fill: '#ff0' }))
            .on('pointerout', () => cancelButton.setStyle({ fill: '#fff' }));

    }

    goBack() {

        // Back to profile using the navigate function from spaceData
        if (this.spaceData && this.spaceData.navigate) {
            this.spaceData.navigate('/profile');
        } else {
            // Fallback to window.location if navigate function is not available
            window.location.href = '/profile';
        }
    }

    async fetchElements() {

        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`${this.apiUrl}/space/elements`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            this.elements = response.data;

        } catch (error) {
            console.error("Error fetching elements:", error);
        }
    }

    async saveSpace() {

        const spaceName = prompt("Choose a name for your space");

        // Logic to save the space to the database // 
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${this.apiUrl}/space/create`, {
                name: spaceName,
                spaceElements: this.placedProps
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            // Call the callback function if it exists
            if (this.spaceData && this.spaceData.onSpaceCreated) {
                this.spaceData.onSpaceCreated(response.data);
            }

            this.goBack();

        } catch (error) {
            console.error("Error saving space:", error);
        }
    }

    update() {
        // Game loop logic // 


    }
}
