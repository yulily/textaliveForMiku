import React, { useEffect, useState, createRef, useMemo } from "react";
import { Player, Ease } from "textalive-app-api"
import p5 from 'p5'
import MoveLyric from './moveLyric'
import fallLyricWorker from "worker-loader!./worker";

const worker = new fallLyricWorker();

export const PlayerControl = () => {
    const [textPlayer, setPlayer] = useState<Player | null>(null);
    const [app, setApp] = useState(null);

    const [song, setSong] = useState<string>('');
    const [artist, setArtist] = useState<string>('');
    // const [songInfo, setSongInfo] = useState<HTMLElement>(''); 再生後に消す

    const [mediaElement, setMediaElement] = useState<HTMLDivElement | null>(null);
    const mdediaDiv = useMemo(() => <div className="media movie" ref={setMediaElement} />, []);

    let drawCanvas:p5|null = useMemo(() => null, []);
    const width = window.innerWidth;
    const height = window.innerHeight;
    // const collors = ["rgb(187,225,14)", "rgb(237,139,190)"];

    let p5CanvasElement: HTMLCanvasElement | null = null;
    let offscreenCanvas: OffscreenCanvas | null = null;

    let playing: boolean = false;
    let time: number = 0;
    useEffect(() => {
        if (typeof window === "undefined" || !mediaElement) {
            return;
        }

        // TextAlive Player を作る
        const textPlayer = new Player({
            app: {
                appAuthor: "Jun Kato",
                appName: "Basic example",
                parameters: [],
            },
            mediaElement,
        });

        const playerListener = {
            // TextAlive App が初期化されたときに呼ばれる
            onAppReady: (app: any) => {
                if (!app.songUrl) {
                    // 楽曲URLが指定されていなければ youtube 指定
                    // textPlayer.createFromSongUrl("http://www.youtube.com/watch?v=a-Nf3QUFkOU");
                    textPlayer.createFromSongUrl("http://www.youtube.com/watch?v=xOKplMgHxxA");
                }
                setApp(app);
            },
            // 音源の再生準備が完了した時に呼ばれる
            onTimerReady: (timer: any) => {},
            // 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
            onVideoReady: () => {
                // 楽曲情報を表示
                setSong(textPlayer.data.song.name);
                setArtist(textPlayer.data.song.artist.name);

                let time = 0;
                drawCanvas = new p5((p5: p5) => {
                    p5.setup = () => {
                        let cnv = p5.createCanvas(width, height);
                        cnv.id('p5CanvasElement');
                        p5.noStroke();
                        p5.frameRate(10);

                        p5CanvasElement = document.getElementById('p5CanvasElement') as HTMLCanvasElement;
                        offscreenCanvas = p5CanvasElement.transferControlToOffscreen();
                    }
                })
            },
            // 動画の再生位置が変更されたときに呼ばれる
            onTimeUpdate: (position: number) => {
                // プレイヤーが準備できていなかったら何もしない
                if (p5CanvasElement === null || drawCanvas === null || !playing || !textPlayer || !textPlayer.video) {
                    return;
                }

                if (time < 1) {
                    drawCanvas.background('rgba(246, 221, 191, ' + Ease.circIn(Math.min(time, 1)) + ')');
                    time += 0.1;
                    return;
                }

                let char = textPlayer.video.findChar(position - 100, { loose: true });
                if (char === null) {
                    return;
                }
                let index = textPlayer.video.findIndex(char);

                let startTime = char.startTime;
                let endTime = char.endTime;

                drawCanvas.background('#F6DDBF');

                if (startTime < position + 100) {
                    const beat = textPlayer.findBeat(position);
                    let progress = 0;
                    if (beat) {
                        progress = beat.progress(position);
                    }

                    let x = 50 * (index % Math.floor(width / 50)) + 10;
                    let y = height / 5;

                    let transparency: number = 0, size: number = 40;

                    // 開始前
                    if (position < startTime) {
                        const progress = 1 - (startTime - position) / 100;
                        transparency = progress;
                        console.log("開始前");
                    }
                    // 表示終了
                    else if (endTime < position) {
                        console.log("表示終了");
                        const moveLyricInstance = new MoveLyric({
                            canvas: offscreenCanvas,
                            x: x,
                            y: y,
                            height: height,
                            char: char.text
                        });
                        if (offscreenCanvas) {
                            worker.postMessage({ action: "init", moveLyric: moveLyricInstance }, [
                                offscreenCanvas
                            ]);
                        }
                        console.log("postMessage");
                        // 発声前
                    } else {
                        console.log("発声前");
                        transparency = 1;
                    }
                    drawCanvas.fill(0, 0, 100, transparency * 100);
                    drawCanvas.textSize(size);
                    drawCanvas.text(char.text, 10 + x, y);
                }
            },
            // 動画の再生位置が変更されたときに呼ばれる（あまりに頻繁な発火を防ぐため一定間隔に間引かれる）
            onThrottledTimeUpdate: (position: number) => {},
            // TextAlive アプリのパラメタが更新されたときに呼ばれる
            onAppParameterUpdate: (name: any, value: any) => {},
            // 再生が始まったら
            onPlay: () => {
                playing = true;
                console.log('onPlay');
            },
            // 再生が一時停止したら
            onPause: () => {
                playing = false;
                console.log('onPause');
            },
            // 再生が停止したら
            onStop: () => {
                playing = false;
                console.log('onStop');
            }
        }
        // TextAlive Player のイベントリスナを登録する
        textPlayer.addListener(playerListener);
        setPlayer(textPlayer);

    }, [mediaElement]);

    return (
        <>
            <div className="songInfo">
                <dl>
                    <dt>artist</dt>
                    <dd>{artist}</dd>
                    <dt>song</dt>
                    <dd>{song}</dd>
                </dl>
            </div>
            {mdediaDiv}
        </>
    );
}


