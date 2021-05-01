import React, { useContext } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { css } from '@emotion/css';
import { StoreContext } from '../utils/storeContext';

export function Panel() {
  const { setStore, state: {
    editorSituation
  } } = useContext(StoreContext);

  return <div className={css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  `}>
    <div className={css`
      width: 240px;
    `}>
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
    </div>
  </div>
}