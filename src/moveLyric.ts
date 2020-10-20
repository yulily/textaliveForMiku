
class MoveLyric {
    public canvas: OffscreenCanvas;
    public x: number;
    public y: number;
    public charText: string;
    public partOfSpeech: string;
    public isChorus: boolean;

    constructor(data: any) {
        this.canvas = data.canvas;
        this.x = data.x;
        this.y = data.y;
        this.charText = data.char;
        this.partOfSpeech = data.partOfSpeech;
        this.isChorus = data.isChorus;
    }
}
export default MoveLyric