import { State, Action, StateContext, Selector } from '@ngxs/store';
import { FileElement } from '@rms-frontend/file-explorer';
import {
  UploadFiles,
  AddFolder,
  DeleteFolder,
  DeleteFile,
  RenameFile,
  RenameFolder,
  MoveFolder,
  MoveFile,
  NavigateTo,
  NavigateUp
} from './file.actions';
import { ImmutableContext, ImmutableSelector } from '@ngxs-labs/immer-adapter';
import { LoggerService } from '../logger.service';
import { Injectable } from '@angular/core';

export interface ExplorerStateModel {
  files: FileElement[];
  currentRoot: FileElement;
  path: string;
}

@State<ExplorerStateModel>({
  name: 'explorer',
  defaults: {
    files: [],
    currentRoot: { id: 'root', name: 'Files', isFolder: true, parent: '' },
    path: ''
  }
})
@Injectable()
export class ExplorerState {
  constructor(public logService: LoggerService) {}

  @Selector()
  @ImmutableSelector()
  static currentSpace(state: ExplorerStateModel) {
    return state.files.filter(file => file.parent === state.currentRoot.id);
  }

  @Selector()
  @ImmutableSelector()
  static currentRoot(state: ExplorerStateModel) {
    return state.currentRoot;
  }

  @Selector()
  static currentPath(state: ExplorerStateModel) {
    return state.path;
  }

  @Action(UploadFiles)
  @ImmutableContext()
  uploadFiles(ctx: StateContext<ExplorerStateModel>, action: UploadFiles) {
    const state = ctx.getState();
    const files = state.files;
    files.push(...action.files);
    this.logService.log(`Uploaded ${action.files.length} files.`);
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = files;
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(AddFolder)
  @ImmutableContext()
  addFolder(ctx: StateContext<ExplorerStateModel>, action: AddFolder) {
    const state = ctx.getState();
    const files = state.files;
    files.push(action.folder);
    this.logService.log(`Added ${action.folder.name} folder.`);
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = files;
      return hereState;
    });
    //Add code to send files to server here
  }
  @Action(DeleteFolder)
  @ImmutableContext()
  deleteFolder(ctx: StateContext<ExplorerStateModel>, action: DeleteFolder) {
    const state = ctx.getState();
    const files = state.files;
    this.logService.log(
      `Deleted ${files.find(a => a.id === action.id).name} folder.`
    );
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = files.filter(
        entry => entry.id !== action.id && entry.parent !== action.id
      );
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(DeleteFile)
  @ImmutableContext()
  deleteFile(ctx: StateContext<ExplorerStateModel>, action: DeleteFile) {
    const state = ctx.getState();
    const files = state.files;
    const filteredFiles = files.filter(entry => entry.id !== action.id);
    this.logService.log(
      `Deleted ${files.find(a => a.id === action.id).name} file.`
    );
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = filteredFiles;
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(RenameFile)
  @ImmutableContext()
  renameFile(ctx: StateContext<ExplorerStateModel>, action: RenameFile) {
    const state = ctx.getState();
    const files = state.files;
    this.logService.log(
      `Renamed file ${files.find(a => a.id === action.id).name} to ${
        action.name
      }.`
    );
    files.find(file => file.id === action.id).name = action.name;
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = files;
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(RenameFolder)
  @ImmutableContext()
  renameFolder(ctx: StateContext<ExplorerStateModel>, action: RenameFolder) {
    const state = ctx.getState();
    const files = state.files;
    this.logService.log(
      `Renamed folder ${files.find(a => a.id === action.id).name} to ${
        action.name
      }.`
    );
    files.find(file => file.id === action.id).name = action.name;
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = files;
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(MoveFolder)
  @ImmutableContext()
  moveFolder(ctx: StateContext<ExplorerStateModel>, action: MoveFolder) {
    const state = ctx.getState();
    const files = state.files;
    this.logService.log(
      `Moved folder ${files.find(a => a.id === action.id).name} to ${
        files.find(a => a.id === action.parent).name
      }.`
    );
    files.find(file => file.id === action.id).parent = action.parent;
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = files;
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(MoveFile)
  @ImmutableContext()
  moveFile(ctx: StateContext<ExplorerStateModel>, action: MoveFile) {
    const state = ctx.getState();
    const files = state.files;
    this.logService.log(
      `Moved file ${files.find(a => a.id === action.id).name} to ${
        files.find(a => a.id === action.parent).name
      }.`
    );
    files.find(file => file.id === action.id).parent = action.parent;
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.files = files;
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(NavigateTo)
  @ImmutableContext()
  navigateTo(ctx: StateContext<ExplorerStateModel>, action: NavigateTo) {
    const state = ctx.getState();
    const newPath = this.pushToPath(state.path, action.folder.name);
    this.logService.log(`Navigated to ${newPath || 'Root'}.`);
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.currentRoot = action.folder;
      hereState.path = newPath;
      return hereState;
    });
    //Add code to send files to server here
  }

  @Action(NavigateUp)
  @ImmutableContext()
  navigateUp(ctx: StateContext<ExplorerStateModel>, action: NavigateUp) {
    const state = ctx.getState();
    const files = state.files;
    const newRoot = files.find(a => a.id === state.currentRoot.parent) || {
      id: 'root',
      name: 'Files',
      isFolder: true,
      parent: ''
    };
    const newPath = this.popFromPath(state.path);
    this.logService.log(`Navigated to ${newPath || 'Root'}.`);
    ctx.setState((hereState: ExplorerStateModel) => {
      hereState.currentRoot = newRoot;
      hereState.path = newPath;
      return hereState;
    });
    //Add code to send files to server here
  }

  pushToPath(path: string, folderName: string) {
    if (path === 'Files') path = '';
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    const split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }
}
