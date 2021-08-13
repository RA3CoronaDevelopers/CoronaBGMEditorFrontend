import React, { useContext } from 'react';
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
} from '@material-ui/core';
import { css } from '@emotion/css';
import { StoreContext } from '../../utils/storeContext';
import { DialogBase } from '../dialogBase';

export function UnitWeightConfig() {
  const {
    setStore,
    data: { unitWeight },
    state: { unitWeightConfigDialogOpen },
  } = useContext(StoreContext);

  return (
    <DialogBase
      open={unitWeightConfigDialogOpen}
      onClose={() =>
        setStore((store) => ({
          ...store,
          state: {
            ...store.state,
            unitWeightConfigDialogOpen: false,
          },
        }))
      }
      header={
        <>
          <Typography
            variant='h5'
            className={css`
              user-select: none;
            `}
          >
            {'单位权值调整'}
          </Typography>
          <Typography
            variant='caption'
            className={css`
              user-select: none;
            `}
          >
            {
              '单位权值是 BGM 播放器判断是否切换对局状态的依据，一般情况下无需更改'
            }
          </Typography>
        </>
      }
      footer={
        <>
          <Button
            onClick={() =>
              setStore((store) => ({
                ...store,
                state: {
                  ...store.state,
                  unitWeightConfigDialogOpen: false,
                },
              }))
            }
          >
            {'关闭'}
          </Button>
        </>
      }
    >
      <List>
        {[
          'AlliedScoutInfantry',
          'AlliedAntiInfantryInfantry',
          'AlliedAntiVehicleInfantry',
          'AlliedEngineer',
          'AlliedInfiltrationInfantry',
          'AlliedCommandoTech1',
          'AlliedMiner',
          'AlliedAntiInfantryVehicle',
          'AlliedAntiAirVehicleTech1',
          'AlliedAntiVehicleVehicleTech1',
          'AlliedAntiStructureVehicle',
          'AlliedAntiVehicleVehicleTech3',
          'AlliedMCV',
          'AlliedAntiGroundAircraft',
          'AlliedFighterAircraft',
          'AlliedSupportAircraft',
          'AlliedBomberAircraft',
          'AlliedSupersonicBomber',
          'AlliedAntiNavalScout',
          'AlliedAntiAirShip',
          'AlliedAntiNavyShipTech1',
          'AlliedAntiStructureShip',
          'AlliedConstructionYard',
          'AlliedOutPost',
          'AlliedPowerPlant',
          'AlliedBarracks',
          'AlliedRefinery',
          'AlliedWarFactory',
          'AlliedNavalYard',
          'AlliedAirfield',
          'AlliedTechStructure',
          'AlliedWallPiece',
          'AlliedWallSegmentPiece',
          'AlliedBaseDefense',
          'AlliedBaseDefenseAdvanced',
          'AlliedSuperWeaponAdvanced',
          'AlliedSuperWeapon',
        ].map((name) => (
          <ListItem>
            <ListItemText primary={name} />
            <ListItemSecondaryAction>
              <TextField
                variant='outlined'
                value={unitWeight[name] || ''}
                margin='dense'
                size='small'
                onChange={(e) =>
                  /^\d*$/.test(e.target.value) &&
                  setStore((store) => ({
                    ...store,
                    data: {
                      ...store.data,
                      unitWeight: {
                        ...store.data.unitWeight,
                        [name]: e.target.value,
                      },
                    },
                  }))
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </DialogBase>
  );
}
