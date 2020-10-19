import React, { useEffect, useState, useMemo } from "react";
import { Player } from "textalive-app-api"
import MoveLyric from './moveLyric'
import lyricWorker from "worker-loader!./worker";

const worker = new lyricWorker();

export const PlayerControl = () => {
    const [, setPlayer] = useState<Player | null>(null);
    const [, setApp] = useState(null);

    const [song, setSong] = useState<string>('');
    const [artist, setArtist] = useState<string>('');

    const [mediaElement, setMediaElement] = useState<HTMLDivElement | null>(null);
    const mdediaDiv = useMemo(() => <div className="media movie" ref={setMediaElement} />, []);

    const width: number = window.innerWidth, height: number = window.innerHeight;

    let offscreenCanvas: OffscreenCanvas | null = null;
    let playing: boolean = false;

    let lastChar: string = '', lastStartTime: number = 0, lastEndTime: number = 0;

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
                let canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
                offscreenCanvas = canvasElement.transferControlToOffscreen();
                console.log("init offscreenCanvas");
                worker.postMessage({ action: "init", size: { width: width, height: height }, canvas: offscreenCanvas }, [offscreenCanvas]);
            },
            // 音源の再生準備が完了した時に呼ばれる
            onTimerReady: (timer: any) => {},
            // 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
            onVideoReady: () => {
                // 楽曲情報を表示
                setSong(textPlayer.data.song.name);
                setArtist(textPlayer.data.song.artist.name);
            },
            // 動画の再生位置が変更されたときに呼ばれる
            onTimeUpdate: (position: number) => {
                // プレイヤーが準備できていなかったら何もしない
                if (offscreenCanvas === null || !playing || !textPlayer || !textPlayer.video) {
                    return;
                }

                let char = textPlayer.video.findChar(position - 100, { loose: true });
                if (char === null) {
                    return;
                }
                let index = textPlayer.video.findIndex(char);

                let startTime = char.startTime;
                let endTime = char.endTime;

                if (startTime < position + 100) {
                    const beat = textPlayer.findBeat(position);
                    let progress = 0;
                    if (beat) {
                        progress = beat.progress(position);
                    }

                    let x = 50 * (index % Math.floor(width / 50)) + 10;
                    let y = height / 5;

                    let transparency: number = 0, size: number = 40;

                    const moveLyricInstance = new MoveLyric({
                        canvas: null,
                        x: x,
                        y: y,
                        height: height,
                        char: char.text
                    });

                    // 開始前
                    if (position < startTime) {
                        const progress = 1 - (startTime - position) / 100;
                        transparency = progress;
                    }
                    // 表示終了
                    else if (endTime < position) {
                        if (lastChar === char.text && lastStartTime === startTime && lastEndTime === endTime) {
                            return;
                        }
                        lastChar = char.text;
                        lastStartTime = startTime;
                        lastEndTime = endTime;

                        worker.postMessage({ action: "fallLyric", size: { width: width, height: height }, moveLyricInstance: moveLyricInstance });
                        // 発声前
                    } else {
                        transparency = 1;
                    }

                    worker.postMessage({ action: "setChar", size: { width: width, height: height }, moveLyricInstance: moveLyricInstance });
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
            <canvas id="canvasElement" width={window.innerWidth} height={window.innerHeight} className="canvasElement" ref={React.createRef()} />   
        </>
    );
}


