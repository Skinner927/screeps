import { ErrorMapper } from "utils/ErrorMapper";
import * as _ from "lodash";
import roleHarvester from "./role.harvester";
import roleUpgrader from "./role.upgrader";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    state: number;
  }

  interface CreepMemory {
    role: string;
    room: string;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }

  interface Role {
    role: string;
    handleTick(creep: Creep): void;
    spawn(spawner: StructureSpawn): ScreepsReturnCode;
  }
}

const roleMappings: Record<string, Role> = {
  [roleHarvester.role]: roleHarvester,
  [roleUpgrader.role]: roleUpgrader,
};

function roomTick(room: Room) {

}


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  let state = Memory.state || 0;
  console.log(`Current game tick is ${Game.time}. State: ${state}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }

  // We only deal with spawn1
  const spawn1 = Game.spawns['Spawn1'];

  // Count creeps by type
  const creepCount = Object.keys(roleMappings).reduce<Record<string, number>>((c, k) => { c[k] = 0; return c }, {});
  _.each(Game.creeps, (c: Creep) => creepCount[c.memory.role]++);

  // Spawn loop
  let gameLoop = true;
  while (gameLoop) {
    switch (state) {
      case 0:
        // First ensure we have 2 workers
        if (creepCount[roleHarvester.role] < 2) {
          // Game.spawns['Spawn1'].room.visual.text(
          //   '🛠️' + spawningCreep.memory.role,
          //   Game.spawns['Spawn1'].pos.x + 1,
          //   Game.spawns['Spawn1'].pos.y,
          //   { align: 'left', opacity: 0.8 });
          roleHarvester.spawn(spawn1)
          gameLoop = false; // Because regardless if pass or fail, this spawner cannot do more
          break;
        }
        state++;
        break;
      case 1:
        // Next ensure we have one upgrader
        if (creepCount[roleUpgrader.role] < 1) {
          roleUpgrader.spawn(spawn1);
          gameLoop = false;
          break;
        }
        state++;
        break;


      default:
        //spawn1.room.visual.text("Nothing to do in SpawnLoop", 10, 10);
        console.log("Nothing to do in SpawnLoop");
        gameLoop = false;
        break;
    }
  }
  Memory.state = state;

  // Tick loop
  _.each(Game.creeps, function (creep: Creep) {
    let handler = roleMappings[creep.memory.role];
    if (handler) {
      handler.handleTick(creep);
    } else {
      console.log("Unknown role: " + creep.memory.role);
    }
  });
});
