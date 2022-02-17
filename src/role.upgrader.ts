const UPGRADER = 'upgrader';

interface UpgraderMemory extends CreepMemory {
  role: typeof UPGRADER;
  working: boolean;
  upgrading: boolean;
}

interface UpgraderCreep extends Creep {
  memory: UpgraderMemory;
}

function handleTick(inCreep: Creep): void {
  const creep = inCreep as UpgraderCreep;
  if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
    creep.memory.upgrading = false;
    creep.say('🔄 harvest');
  }
  if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
    creep.memory.upgrading = true;
    creep.say('⚡ upgrade');
  }

  if (creep.memory.upgrading) {
    if (creep.room.controller && creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
  else {
    var sources = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }
}

function spawn(spawner: StructureSpawn): ScreepsReturnCode {
  var newName = 'Upgrader' + Game.time;
  const memory: UpgraderMemory = {
    role: UPGRADER,
    room: spawner.room.name,
    working: false,
    upgrading: false,
  }
  const ret = spawner.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, { memory });
  if (OK === ret) {
    console.log('Spawning new upgrader: ' + newName);
  }
  return ret;
}

const upgraderRole: Role = {
  role: UPGRADER,
  handleTick,
  spawn
};

export default upgraderRole;
