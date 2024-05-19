import { Group } from 'three';

class MeshManager {
  // Private properties to store groups
  _userGroup;
  _userDataGroup;
  _allMeshGroup;

  constructor() {
    // Initialize groups for user meshes and user data meshes
    this._userGroup = new Group();
    this._userDataGroup = new Group();

    // Create a parent group to hold all user-related groups
    this._allMeshGroup = new Group();
    this._allMeshGroup.add(this._userGroup);
    this._allMeshGroup.add(this._userDataGroup);
  }

  // Getter for user group
  get userGroup() {
    return this._userGroup;
  }

  // Getter for traversed user group, returns an array of mesh objects within the user group
  get traversedUserGroup() {
    const meshArray = [];
    // Traverse the user group and collect mesh objects
    this._userGroup.traverse((object) => {
      if (object.isMesh) {
        meshArray.push(object);
      }
    });
    return meshArray;
  }

  // Getter for user data group
  get userDataGroup() {
    return this._userDataGroup;
  }

  // Getter for all mesh group
  get allMeshGroup() {
    return this._allMeshGroup;
  }
}

export default MeshManager;
