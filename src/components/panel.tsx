import React, { useContext } from 'react';
import {
  FormControl, FormControlLabel, InputLabel,
  Select, MenuItem, Button, TextField, Switch, InputAdornment
} from '@material-ui/core';
import { css } from '@emotion/css';
import { StoreContext } from '../utils/storeContext';

export function Panel() {
  const { setStore, data: {
    tracks
  }, state: {
    editorSituation,
    nowPlayingTrack,
    trackBpm,
    trackAllowBeats,
    trackBeatsOffset,
    trackBeatsPerBar
  } } = useContext(StoreContext);

  return <div className={css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  `}>
    <FormControl fullWidth variant='filled'>
      <InputLabel>{'当前轨道'}</InputLabel>
      <Select
        value={nowPlayingTrack}
        onChange={e => setStore(store => ({
          ...store,
          state: {
            ...store.state,
            nowPlayingTrack: +(e.target.value) as number,
            progress: 0,
            isPlaying: false
          }
        }))}
      >
        {tracks.map((track, index) => <MenuItem value={index}>
          {`${track.id}(#${index})`}
        </MenuItem>)}
      </Select>
    </FormControl>
    <FormControl fullWidth variant='filled'>
      <InputLabel>{'状态'}</InputLabel>
      <Select
        value={editorSituation}
        onChange={e => setStore(store => ({
          ...store, state: {
            ...store.state,
            editorSituation: e.target.value as string
          }
        }))}
      >
        <MenuItem value='Mute'>{'Mute(静音)'}</MenuItem>
        <MenuItem value='MenuTrack'>{'MenuTrack(主菜单)'}</MenuItem>
        <MenuItem value='Peace'>{'Peace(和平)'}</MenuItem>
        <MenuItem value='TinyFight'>{'TinyFight(小规模战斗)'}</MenuItem>
        <MenuItem value='Fight'>{'Fight(大规模战斗)'}</MenuItem>
        <MenuItem value='Advantage'>{'Advantage(处于优势)'}</MenuItem>
        <MenuItem value='Disadvantage'>{'Disadvantage(处于劣势)'}</MenuItem>
        <MenuItem value='Disaster'>{'Disaster(遭受战术打击)'}</MenuItem>
        <MenuItem value='PostGameVictory'>{'PostGameVictory(胜利)'}</MenuItem>
        <MenuItem value='PostGameDefeat'>{'PostGameDefeat(失败)'}</MenuItem>
      </Select>
    </FormControl>
    <div className={css`
      margin: 8px 0px;
    `} />
    <TextField
      fullWidth variant='filled' type='number' label='BPM'
      value={trackBpm} onChange={e => setStore(store => ({
        ...store,
        state: {
          ...store.state,
          trackBpm: +e.target.value
        }
      }))}
    />
    <div className={css`
      margin-left: 16px;
    `}>
      <FormControlLabel label='启用节拍器' control={<Switch
        checked={trackAllowBeats}
        onChange={(_e, checked) => setStore(store => ({
          ...store,
          state: {
            ...store.state,
            trackAllowBeats: checked
          }
        }))}
      />} />
    </div>
    <TextField
      fullWidth variant='filled' type='number' disabled={!trackAllowBeats} label='节拍偏移'
      value={trackBeatsOffset} onChange={e => setStore(store => ({
        ...store,
        state: {
          ...store.state,
          trackBeatsOffset: +e.target.value
        }
      }))}
      InputProps={{
        endAdornment: <InputAdornment position='end'>
          <div className={css`
            margin-top: 16px;
          `}>
            {'ms'}
          </div>
        </InputAdornment>
      }}
    />
    <TextField
      fullWidth variant='filled' type='number' disabled={!trackAllowBeats} label='每节拍数'
      value={trackBeatsPerBar} onChange={e => setStore(store => ({
        ...store,
        state: {
          ...store.state,
          trackBeatsPerBar: +e.target.value
        }
      }))}
    />
    <div className={css`
      margin: 8px 0px;
    `} />
    <Button fullWidth variant='outlined' onClick={() => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        unitWeightConfigDialogOpen: true
      }
    }))}>
      {'调整单位权值'}
    </Button>
    <Button fullWidth variant='outlined' onClick={() => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fsmConfigDialogOpen: true
      }
    }))}>
      {'调整全局权值'}
    </Button>
  </div>
}