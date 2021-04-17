/**
 * This custom ng-new implementation is a slightly tweaked version of the original
 * written for the Angular CLI:
 * https://github.com/angular/angular-cli/blob/11.2.x/packages/schematics/angular/ng-new/index.ts
 *
 * The original license information is below.
 *
 * -----------------------------------------------------------
 *
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  apply,
  chain,
  empty,
  mergeWith,
  move,
  noop,
  schematic,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  NodePackageLinkTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
/**
 * We are able to use the full, unaltered Schemas directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import type { Schema as NgNewOptions } from '@schematics/angular/ng-new/schema';
import { validateProjectName } from '@schematics/angular/utility/validation';
import type { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

export default function (options: NgNewOptions): Rule {
  console.log('Custom ng-new');
  if (!options.name) {
    throw new SchematicsException(`Invalid options, "name" is required.`);
  }

  validateProjectName(options.name);

  if (!options.directory) {
    options.directory = options.name;
  }

  const workspaceOptions: WorkspaceOptions = {
    name: options.name,
    version: options.version,
    newProjectRoot: options.newProjectRoot,
    minimal: options.minimal,
    strict: options.strict,
    packageManager: options.packageManager,
  };
  const applicationOptions: ApplicationOptions = {
    projectRoot: '',
    name: options.name,
    inlineStyle: options.inlineStyle,
    inlineTemplate: options.inlineTemplate,
    prefix: options.prefix,
    viewEncapsulation: options.viewEncapsulation,
    routing: options.routing,
    style: options.style,
    skipTests: options.skipTests,
    skipPackageJson: false,
    // always 'skipInstall' here, so that we do it after the move
    skipInstall: true,
    strict: options.strict,
    minimal: options.minimal,
    legacyBrowsers: options.legacyBrowsers || undefined,
  };

  return chain([
    mergeWith(
      apply(empty(), [
        schematic('workspace', workspaceOptions),
        options.createApplication
          ? schematic('application', applicationOptions)
          : noop,
        move(options.directory),
      ]),
    ),
    (_host: Tree, context: SchematicContext) => {
      let packageTask;
      if (!options.skipInstall) {
        packageTask = context.addTask(
          new NodePackageInstallTask({
            workingDirectory: options.directory,
            packageManager: options.packageManager,
          }),
        );
        if (options.linkCli) {
          packageTask = context.addTask(
            new NodePackageLinkTask('@angular/cli', options.directory),
            [packageTask],
          );
        }
      }
      if (!options.skipGit) {
        const commit =
          typeof options.commit == 'object'
            ? options.commit
            : options.commit
            ? {}
            : false;

        context.addTask(
          new RepositoryInitializerTask(options.directory, commit),
          packageTask ? [packageTask] : [],
        );
      }
    },
  ]);
}
