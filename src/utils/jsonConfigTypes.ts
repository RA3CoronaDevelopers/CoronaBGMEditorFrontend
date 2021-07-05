export interface IConfigMain {
  musicFiles: {
    [name: string]: string;
  };
  unitWeight: IUnitWeight;
  fsmConfig: IFsmConfig;
  tracks: ITrack[];
}

export interface IUnitWeight {
  'AlliedScoutInfantry': number;
  'AlliedAntiInfantryInfantry': number;
  'AlliedAntiVehicleInfantry': number;
  'AlliedEngineer': number;
  'AlliedInfiltrationInfantry': number;
  'AlliedCommandoTech1': number;
  'AlliedMiner': number;
  'AlliedAntiInfantryVehicle': number;
  'AlliedAntiAirVehicleTech1': number;
  'AlliedAntiVehicleVehicleTech1': number;
  'AlliedAntiStructureVehicle': number;
  'AlliedAntiVehicleVehicleTech3': number;
  'AlliedMCV': number;
  'AlliedAntiGroundAircraft': number;
  'AlliedFighterAircraft': number;
  'AlliedSupportAircraft': number;
  'AlliedBomberAircraft': number;
  'AlliedSupersonicBomber': number;
  'AlliedAntiNavalScout': number;
  'AlliedAntiAirShip': number;
  'AlliedAntiNavyShipTech1': number;
  'AlliedAntiStructureShip': number;
  'AlliedConstructionYard': number;
  'AlliedOutPost': number;
  'AlliedPowerPlant': number;
  'AlliedBarracks': number;
  'AlliedRefinery': number;
  'AlliedWarFactory': number;
  'AlliedNavalYard': number;
  'AlliedAirfield': number;
  'AlliedTechStructure': number;
  'AlliedWallPiece': number;
  'AlliedWallSegmentPiece': number;
  'AlliedBaseDefense': number;
  'AlliedBaseDefenseAdvanced': number;
  'AlliedSuperWeapon': number;
  'AlliedSuperWeaponAdvanced': number;
}

export interface IFsmConfig {
  interval: number;
  fightThreshold: number;
  advantageThreshold: number;
  disadvantageThreshold: number;
}

export interface ITrack {
  name: string;
  musicId: string;
  startOffset: number;
  length: number;
  beatsPerMinutes: number;
  beatsPerBar: number;
  checkPoints?: ICheckPoint[];
  defaultCheckPoints?: IDefaultCheckPoint[];
}

export interface ICheckPoint {
  time: number;
  destinations?: IDestination[];
  defaultDestinations?: IDefaultDestination[];
}

export interface IDefaultCheckPoint {
  condition: string;
  jumpTo: IJumpTo[];
}

export interface IDestination {
  condition: string;
  jumpTo: IJumpTo[];
}

export interface IDefaultDestination {
  jumpTo: IJumpTo[];
}

export interface IJumpTo {
  targetTrackId: string;
  targetOffset: number;
  fadeOutDelay: number;
  fadeOutDuration: number;
  targetFadeInDelay: number;
  targetFadeInDuration: number;
}

export const defaultUnitWeight: IUnitWeight = {
  'AlliedScoutInfantry': 200,
  'AlliedAntiInfantryInfantry': 200,
  'AlliedAntiVehicleInfantry': 300,
  'AlliedEngineer': 500,
  'AlliedInfiltrationInfantry': 1000,
  'AlliedCommandoTech1': 2000,
  'AlliedMiner': 1000,
  'AlliedAntiInfantryVehicle': 750,
  'AlliedAntiAirVehicleTech1': 800,
  'AlliedAntiVehicleVehicleTech1': 950,
  'AlliedAntiStructureVehicle': 1400,
  'AlliedAntiVehicleVehicleTech3': 1600,
  'AlliedMCV': 5000,
  'AlliedAntiGroundAircraft': 1200,
  'AlliedFighterAircraft': 1000,
  'AlliedSupportAircraft': 1600,
  'AlliedBomberAircraft': 2000,
  'AlliedSupersonicBomber': 5000,
  'AlliedAntiNavalScout': 750,
  'AlliedAntiAirShip': 900,
  'AlliedAntiNavyShipTech1': 1500,
  'AlliedAntiStructureShip': 2000,
  'AlliedConstructionYard': 5000,
  'AlliedOutPost': 1000,
  'AlliedPowerPlant': 800,
  'AlliedBarracks': 500,
  'AlliedRefinery': 2000,
  'AlliedWarFactory': 2000,
  'AlliedNavalYard': 1000,
  'AlliedAirfield': 1000,
  'AlliedTechStructure': 750,
  'AlliedWallPiece': 10,
  'AlliedWallSegmentPiece': 10,
  'AlliedBaseDefense': 800,
  'AlliedBaseDefenseAdvanced': 120,
  'AlliedSuperWeapon': 1500,
  'AlliedSuperWeaponAdvanced': 2500,
};

export const defaultFsmConfig = {
  'interval': 20,
  'fightThreshold': 120,
  'advantageThreshold': 2.7,
  'disadvantageThreshold': 2.5,
};
