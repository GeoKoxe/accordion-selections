import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';
import {VERSION as CDK_VERSION} from '@angular/cdk';
import {VERSION as MAT_VERSION} from '@angular/material/core';
import {CdkAccordionOverviewExample} from './accordion.component/accordion.component';

console.info('Angular CDK version', CDK_VERSION.full);
console.info('Angular Material version', MAT_VERSION.full);

bootstrapApplication(CdkAccordionOverviewExample, {
  providers: [provideHttpClient()],
}).catch(err => console.error(err));
