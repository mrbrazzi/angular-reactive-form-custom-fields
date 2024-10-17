import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormComponent } from './form/form.component';
import { provideAnimations } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormComponent],
  template: `
    <h1>Custom Form Example</h1>
    <app-form [options]="options" [defaultData]="defaultData"></app-form>
  `,
})
export class App {
  options = [
    { value: 1, label: 'IP v4 address (max 2)' },
    { value: 2, label: 'IP v4 or v6 address (max 63)' },
    { value: 3, label: 'FQDN (max 1)' },
    { value: 4, label: 'Number (68-65535, max 1)' },
    { value: 5, label: 'Filename with path (max 1)' }
  ];

  defaultData = {
    option: 1,
    values: ['192.168.0.1', '10.0.0.1']
  };
}

bootstrapApplication(App, {
  providers: [provideAnimations()]
});