/* This file consists of type overrides */

// This would be a sufficent type override for CreepMemory but let's be
// explicit so we can keep track of what we assign to memory.
// type CreepMemory = Record<string, any>;

interface CreepMemory {
  // Ensure to mark as nullable if it is
  role: string;
}

