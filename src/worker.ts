const ctx: Worker = self as any;
import MoveLyric from './moveLyric'

let offscreenCanvas: OffscreenCanvas|null = null;
let context: OffscreenCanvasRenderingContext2D | null = null;

const fontSize = 28;

const defaultCollor = 'rgb(250, 246, 240)';
const nounCollor = 'rgb(250, 217, 175)';
const verbColor = 'rgb(250, 186, 175)';

const melodyDefaultColor: Array<string> = ['rgba(243, 217, 133, 1)','rgba(253, 77, 10, 0)'];
const melodyChorusColor: Array<string> = ['rgba(3, 236, 252, 1)', 'rgba(10, 217, 253, 0)'];
let melodyColor: Array<string> = melodyDefaultColor;

const bgDefaultColor: string = 'rgb(82, 57, 57)';
const bgChorusColor: string = 'rgb(57, 81, 82)';
let bgColor: string = bgDefaultColor;

const fontStyle = fontSize + "px '游明朝体', 'YuMincho'";
ctx.addEventListener('message', event => {

    if (!offscreenCanvas) {
        if (event.data.action !== 'init') {
            console.log('You need to call init first');
        }
        offscreenCanvas = event.data.canvas;
        context = offscreenCanvas!.getContext("2d");
    }

    if (offscreenCanvas === null || context === null) {
        console.log("couldn't get the offscreenCanvas or couldn't get the OffscreenCanvasRenderingContext2D");
        return;
    }

    let width: number = event.data.size.width;
    let height: number = event.data.size.height;

    let moveLyricInstance: MoveLyric|null = null;

    let x: number = 0, y: number = 0, charText: string = '', partOfSpeech: string = 'X', isChorus: boolean = false;
    if (event.data.moveLyricInstance) {
        moveLyricInstance = event.data.moveLyricInstance;
        if (moveLyricInstance === null) {
            console.log("moveLyricInstance is null");
            return;
        }
        x = moveLyricInstance.x;
        y = moveLyricInstance.y;
        charText = moveLyricInstance.charText;
        partOfSpeech = moveLyricInstance.partOfSpeech;
        isChorus = moveLyricInstance.isChorus;
    }

    let fontColor = defaultCollor;
    if (partOfSpeech === 'N' || partOfSpeech === 'PN') {
        fontColor = nounCollor;
    } else if (partOfSpeech === 'V' || partOfSpeech === 'U' || partOfSpeech === 'S') {
        fontColor = verbColor;
    }
 
    if (event.data.action === 'setChar' || event.data.action === 'fallLyric') {
        let nowMelodyColor = isChorus ? melodyChorusColor : melodyDefaultColor;
        let nowBgColor = isChorus ? bgChorusColor : bgDefaultColor;

        if (bgColor !== nowBgColor) {
            bgColor = nowBgColor;
            context.fillStyle = bgColor;
            context.fillRect(0, 0, width, height);
            drawLight(width, melodyColor);
        }

        if (melodyColor !== nowMelodyColor) {
            melodyColor = nowMelodyColor;
            drawLight(width, melodyColor);
        }
    }

    switch (event.data.action) {
        case 'init':
            let time = 0;
            let fadeIn = () => {
                if (context === null) {
                    return;
                }
                context.fillStyle = 'rgba(82, 57, 57, ' + Math.min(time, 1) + ')';
                context.fillRect(0, 0, width, height);

                time += 0.05;
                let callbackId = requestAnimationFrame(fadeIn);
                if (1 <= time) {
                    cancelAnimationFrame(callbackId);
                    drawLight(width, melodyColor);
                }
            }
            fadeIn();
            break;
        case 'setChar':
            if (moveLyricInstance === null) {
                console.log("'setChar' requires a moveLyricInstance");
                return;
            }
            context.font = fontStyle;
            context.fillStyle = fontColor;
            context.fillText(charText, x, y);
            break;
        case 'fallLyric':
            if (moveLyricInstance === null) {
                console.log("'fallLyric' requires a moveLyricInstance");
                return;
            }    
            fall(charText, x, y, height, fontColor);
            break;
        default:
            console.log('undefind action');
    }

});

let drawLight = (width: number, melodyColor: Array<string>) => {
    if (context !== null) {
        let x = width / 2;
        let y = 0;
        let gradRadius = width / 6;
        let light = context.createRadialGradient(x, -gradRadius / 1.7, gradRadius, x, -gradRadius / 1.7, gradRadius * 1.3);
        light.addColorStop(0, melodyColor[0]);
        light.addColorStop(0.9, melodyColor[1]);
        context.beginPath();
        context.arc(x, -gradRadius / 4, gradRadius * 1.3, 0, Math.PI * 2, false);
        context.fillStyle = light;
        context.fill();
    }
}

let fall = (charText: string, x: number, y: number, height: number, fontColor: string) => {
    loop();

    y = Math.floor(y);
    function loop(){
        if (context !== null) {
            let callbackId = requestAnimationFrame(loop);

            let diffY = Math.floor(height / 130) * easeInOutSine(y / height);

            context.fillStyle = bgColor;
            context.fillRect(x, y - (diffY + fontSize), fontSize, fontSize);
            
            context.font = fontStyle;
            context.fillStyle = fontColor;
            context.fillText(charText, x, y);

            y += diffY;
            if (height + fontSize < y) {
                context.fillStyle = bgColor;
                context.fillRect(x, y - (diffY + fontSize), fontSize, fontSize);
                cancelAnimationFrame(callbackId);
            }
        }
    }
}

function easeInOutSine(x: number): number {
    return Math.sin((x * Math.PI) / 2);
}
export default ctx
