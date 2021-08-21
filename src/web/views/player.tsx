import React from "react";
import { Typography, IconButton, CircularProgress } from "@material-ui/core";
import { css } from "@emotion/css";
import { Icon } from "@mdi/react";
import { mdiDotsVertical } from "@mdi/js";
import { CheckPointController } from "./checkPointController";
import { IProps, useData } from "../models/player";
import { Waveform } from "../components/waveform";

export function Player(props: IProps) {
  const {
    nowPlayingTrack,
    nowPlayingProgress,
    trackId,
    track,

    isReady,
    mouseOverPosition,
    setMouseOverPosition,
    checkPointControllerOpen,
    setCheckPointControllerOpen,

    audioOriginDataRef,

    onMouseDown,
  } = useData(props);

  return (
    <div
      className={css`
        width: 100%;
        margin: 8px 0px;
        display: flex;
      `}
    >
      {/* 播放器画布 */}
      <div
        className={css`
          width: 60px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          user-select: none;
        `}
      >
        <div
          className={css`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <Typography variant="h6">{`#${track.order}`}</Typography>
          <IconButton size="small">
            <Icon path={mdiDotsVertical} size={0.8} />
          </IconButton>
        </div>
        <Typography variant="caption">{track.name}</Typography>
      </div>
      <div
        className={css`
          width: calc(100% - 60px);
          height: 100%;
        `}
      >
        <div
          className={css`
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          `}
        >
          <div
            className={css`
              height: 100px;
              width: 100%;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
              position: relative;
            `}
          >
            {isReady && (
              <div
                className={css`
                  left: 0px;
                  top: 0px;
                  width: 100%;
                  height: 100%;
                  position: absolute;
                  z-index: -1;
                `}
              >
                <Waveform
                  audioOriginDataRef={audioOriginDataRef}
                  trackId={trackId}
                  selectedPoints={track.checkPoints.map(({ time }) =>
                    Math.min((time / track.length) * 100, 100)
                  )}
                  onClick={onMouseDown}
                />
              </div>
            )}
            {/* 加载圈 */}
            <div
              className={css`
                left: 4px;
                top: 4px;
                position: absolute;
                user-select: none;
              `}
            >
              <Typography variant="caption">{track.musicId}</Typography>
            </div>
            <div
              className={css`
                left: 0px;
                top: 0px;
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              {!isReady && <CircularProgress size={32} />}
            </div>
          </div>
          <div
            className={css`
              position: relative;
              height: 60px;
              width: 100%;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 4px;
            `}
          >
            {/* 时间轴控制窗口 */}
            {track.checkPoints?.map((_checkPoint, checkPointId) => (
              <CheckPointController
                open={checkPointControllerOpen === checkPointId}
                trackId={trackId}
                checkPointId={checkPointId}
                audioOriginDataRef={audioOriginDataRef}
                onClose={() => setCheckPointControllerOpen(-1)}
              />
            ))}
            {/* 时间轴列表 */}
            {track.checkPoints?.map(
              ({ time, destinations, defaultDestinations }, checkPointId) => (
                <div
                  className={css`
                    position: absolute;
                    top: 0px;
                    height: 100%;
                    width: 60px;
                    overflow: hidden;
                    box-sizing: border-box;
                    padding: 2px;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    transition: background 0.2s;
                    &:hover {
                      background: rgba(255, 255, 255, 0.4);
                    }
                    &:active {
                      background: rgba(255, 255, 255, 0.8);
                    }
                  `}
                  style={{
                    left: `min(${
                      (time / track.length) * 100
                    }%, calc(100% - 60px))`,
                  }}
                  onClick={() => setCheckPointControllerOpen(checkPointId)}
                >
                  {destinations?.map(({ condition }) => (
                    <div
                      className={css`
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: flex-start;
                        color: #fff;
                        font-size: 10px;
                        user-select: none;
                      `}
                    >
                      {condition}
                    </div>
                  ))}
                  {defaultDestinations?.map(() => (
                    <div
                      className={css`
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: flex-start;
                        color: #fff;
                        font-size: 10px;
                        user-select: none;
                      `}
                    >
                      {"(默认跳转)"}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
